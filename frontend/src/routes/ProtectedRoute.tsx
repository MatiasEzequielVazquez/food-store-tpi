import { Navigate, Outlet } from 'react-router-dom'
import type { Rol } from '../features/usuarios/types/usuario'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  roles?: Rol[]
}

/** Sin sesión redirige a /login; sin el rol, a /unauthorized. */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  if (cargando) {
    return <p className="py-10 text-center text-gray-500">Verificando sesión...</p>
  }
  if (!usuario) {
    return <Navigate to="/login" replace />
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}