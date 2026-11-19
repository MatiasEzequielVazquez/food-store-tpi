from datetime import datetime, timedelta, timezone

from app.core.database import utc_now
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

# Zona horaria del negocio para el indicador pedidos_hoy (Argentina, UTC-3, sin horario de verano).
ZONA_NEGOCIO = timezone(timedelta(hours=-3))

# Mapa de transiciones válidas (RN-02). Los estados terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaDeNegocio(Exception):
    """Base de las violaciones de reglas de negocio (400)."""


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


class PedidoNoCancelable(ReglaDeNegocio):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        """RN-01: todo ocurre en una sola transacción; si algo falla, no se persiste nada."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: Usuario, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        """El user ve sus pedidos; el admin ve todos (RN-04)."""
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            items, total = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """El admin avanza o cancela desde cualquier estado no terminal (RN-02, RN-03)."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        """El dueño cancela solo desde PENDIENTE (RN-03, RN-04)."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            # Inicio del día en la zona del negocio, expresado en UTC para comparar con created_at.
            inicio_hoy = (
                datetime.now(ZONA_NEGOCIO)
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .astimezone(timezone.utc)
            )
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(PENDIENTE),
                en_preparacion=uow.pedidos.count_by_estado(EN_PREPARACION),
                entregados=uow.pedidos.count_by_estado(ENTREGADO),
                cancelados=uow.pedidos.count_by_estado(CANCELADO),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(ENTREGADO),
            )

    @staticmethod
    def _get_pedido(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # La transición se valida antes de modificar el pedido.
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(
                f"Transición inválida: {pedido.estado} -> {nuevo_estado}"
            )
        if nuevo_estado == CANCELADO:
            # RN-03: se restituye el stock en la misma transacción que cambia el estado.
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto is not None:
                    producto.stock += detalle.cantidad
        pedido.estado = nuevo_estado
        pedido.updated_at = utc_now()