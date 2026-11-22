# Food Store

Trabajo Práctico Integrador de Programación 4: sistema de pedidos de comida con backend FastAPI + SQLModel + PostgreSQL y frontend React + TypeScript.

- Repositorio: https://github.com/MatiasEzequielVazquez/food-store-tpi
- Video de demostración: [Link_al_video](https://drive.google.com/file/d/1XW8kV1ccNADLLfYRuNzPktONh7-IaKsA/view?usp=drive_link)

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior |

## Obtener el proyecto

```bash
git clone https://github.com/MatiasEzequielVazquez/food-store-tpi.git
cd food-store-tpi
```

## Backend

### Instalación y ejecución

1. Crear la base de datos en PostgreSQL:

   ```bash
   createdb foodstore_db
   ```

2. Crear el entorno virtual e instalar las dependencias:

   ```bash
   cd backend
   python -m venv venv
   # Linux / macOS
   source venv/bin/activate
   # Windows
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Copiar las variables de entorno y completar `DATABASE_URL` con el usuario y la contraseña de PostgreSQL:

   ```bash
   # Linux / macOS
   cp .env.example .env
   # Windows
   copy .env.example .env
   ```

4. Cargar los datos iniciales (idempotente, se puede ejecutar más de una vez):

   ```bash
   python -m app.db.seed
   ```

5. Levantar la API:

   ```bash
   uvicorn app.main:app --reload
   ```

La API queda en `http://localhost:8000/api/v1` y la documentación en `http://localhost:8000/docs` y `http://localhost:8000/redoc`.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

## Frontend

### Instalación y ejecución

Con el backend en ejecución, en otra terminal desde la raíz del proyecto:

```bash
cd frontend
# Linux / macOS
cp .env.example .env
# Windows
copy .env.example .env
pnpm install
pnpm build
pnpm dev
```

La aplicación queda en `http://localhost:5173`. `pnpm build` verifica los tipos y genera la versión de producción.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuario del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

El seed también carga 3 categorías y 9 productos con stock. Los clientes se registran desde `/register` y reciben el rol `user`.