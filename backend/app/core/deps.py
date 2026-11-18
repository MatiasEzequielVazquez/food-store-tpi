from typing import Annotated, Callable

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> Usuario:
    """Lee la cookie access_token, valida firma y expiración y carga el usuario."""
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
    )
    if not access_token:
        raise no_autenticado
    username = decode_access_token(access_token)
    if username is None:
        raise no_autenticado
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
    if usuario is None:
        raise no_autenticado
    return usuario


def get_current_active_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    def verificar_rol(
        usuario: Annotated[Usuario, Depends(get_current_active_user)],
    ) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta operación",
            )
        return usuario

    return verificar_rol