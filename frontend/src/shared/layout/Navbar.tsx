import { useQueryClient } from '@tanstack/react-query'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

function claseLink({ isActive }: { isActive: boolean }): string {
  return `text-sm ${isActive ? 'font-semibold text-orange-700' : 'text-gray-700 hover:text-orange-700'}`
}

export default function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadCarrito = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-orange-700">
          Food Store
        </Link>
        <NavLink to="/" end className={claseLink}>
          Catálogo
        </NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito ({cantidadCarrito})
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={claseLink}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === 'admin' && (
          <>
            <NavLink to="/admin/resumen" className={claseLink}>
              Resumen
            </NavLink>
            <NavLink to="/admin/categorias" className={claseLink}>
              Categorías
            </NavLink>
            <NavLink to="/admin/productos" className={claseLink}>
              Productos
            </NavLink>
            <NavLink to="/admin/pedidos" className={claseLink}>
              Pedidos
            </NavLink>
            <NavLink to="/admin/usuarios" className={claseLink}>
              Usuarios
            </NavLink>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-gray-600">
                {usuario.full_name} ({usuario.role})
              </span>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="text-sm text-red-600 hover:underline"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseLink}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}