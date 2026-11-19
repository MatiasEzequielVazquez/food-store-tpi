"""Carga inicial idempotente: usuario admin, categorías y productos.

Uso: python -m app.db.seed
"""

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas caseras"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Bebidas frías"),
]

# (categoría, nombre, descripción, precio_base, stock)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga y tomate", 6500.0, 20),
    ("Hamburguesas", "Hamburguesa doble cheddar", "Doble carne con cheddar", 8900.0, 15),
    ("Hamburguesas", "Hamburguesa veggie", "Medallón de lentejas", 7200.0, 10),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate y muzzarella", 9000.0, 12),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate y ajo", 10500.0, 10),
    ("Pizzas", "Pizza fugazzeta", "Cebolla y muzzarella", 9800.0, 8),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1500.0, 50),
    ("Bebidas", "Gaseosa cola 500 ml", "Línea regular", 2200.0, 40),
    ("Bebidas", "Limonada 500 ml", "Con menta y jengibre", 2800.0, 25),
]


def _imagen(nombre: str) -> str:
    return f"https://placehold.co/400x300?text={nombre.replace(' ', '+')}"


def seed_admin() -> None:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(ADMIN["username"]) is None:
            uow.usuarios.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )


def seed_categorias() -> None:
    with CategoriaUnitOfWork() as uow:
        for nombre, descripcion in CATEGORIAS:
            if uow.categorias.get_by_nombre(nombre) is None:
                uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))


def seed_productos() -> None:
    with ProductoUnitOfWork() as uow:
        existentes = {p.nombre for p in uow.productos.get_all()}
        for categoria_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            if nombre in existentes:
                continue
            categoria = uow.categorias.get_by_nombre(categoria_nombre)
            if categoria is None:
                continue
            uow.productos.add(
                Producto(
                    categoria_id=categoria.id,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_imagen(nombre),
                    stock=stock,
                )
            )


def main() -> None:
    create_all_tables()
    seed_admin()
    seed_categorias()
    seed_productos()
    print("Seed completado: admin, categorías y productos cargados.")


if __name__ == "__main__":
    main()