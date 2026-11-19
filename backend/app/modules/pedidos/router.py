from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

UsuarioActual = Annotated[Usuario, Depends(get_current_active_user)]
AdminActual = Annotated[Usuario, Depends(require_role(["admin"]))]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServicioPedidos = Annotated[PedidoService, Depends(get_pedido_service)]


def _traducir(error: Exception) -> HTTPException:
    """Traduce las excepciones de dominio a HTTPException."""
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


ERRORES_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate, usuario: UsuarioActual, service: ServicioPedidos
) -> PedidoRead:
    try:
        return service.crear(data, usuario)
    except ERRORES_DOMINIO as e:
        raise _traducir(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActual,
    service: ServicioPedidos,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{pedido_id} para que "resumen" no se interprete como id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminActual, service: ServicioPedidos) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int, usuario: UsuarioActual, service: ServicioPedidos
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES_DOMINIO as e:
        raise _traducir(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int, data: CambioEstado, _: AdminActual, service: ServicioPedidos
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ERRORES_DOMINIO as e:
        raise _traducir(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int, usuario: UsuarioActual, service: ServicioPedidos
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES_DOMINIO as e:
        raise _traducir(e)