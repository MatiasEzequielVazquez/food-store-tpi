from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class DatosInvalidos(Exception):
    pass


def _validar_nombre(nombre: str) -> None:
    if not 2 <= len(nombre) <= 100:
        raise DatosInvalidos("El nombre debe tener entre 2 y 100 caracteres")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._get_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            _validar_nombre(data.nombre)
            # La baja lógica no libera el nombre: se busca entre activas e inactivas.
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")
            categoria = uow.categorias.add(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in cambios:
                _validar_nombre(cambios["nombre"])
                existente = uow.categorias.get_by_nombre(cambios["nombre"])
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(
                        f"Ya existe una categoría con el nombre '{cambios['nombre']}'"
                    )
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            categoria.activo = False

    @staticmethod
    def _get_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")
        return categoria