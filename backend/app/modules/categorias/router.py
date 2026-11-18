from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    DatosInvalidos,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])

AdminActual = Annotated[Usuario, Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServicioCategorias = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServicioCategorias) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServicioCategorias) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate, _: AdminActual, service: ServicioCategorias
) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DatosInvalidos as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, _: AdminActual, service: ServicioCategorias
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DatosInvalidos as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int, _: AdminActual, service: ServicioCategorias
) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)