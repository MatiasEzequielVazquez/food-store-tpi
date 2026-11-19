from datetime import datetime

from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None,
        skip: int,
        limit: int,
        estado: str | None = None,
    ) -> tuple[list[Pedido], int]:
        """Pedidos de un usuario; con usuario_id None devuelve los de todos los usuarios."""
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Pedido).where(*condiciones).order_by(Pedido.id.desc()).offset(skip).limit(limit)
        ).all()
        return list(items), total

    def count_by_estado(self, estado: str) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        ).one()

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_by_estado(self, estado: str) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        ).one()
        return float(total)