import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  // Única llamada en useEffect: confirmar la sesión al montar la aplicación.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-orange-700">Food Store</h1>
      <p className="text-gray-700">
        {cargando
          ? 'Verificando sesión...'
          : usuario
            ? `Sesión: ${usuario.full_name} (${usuario.role})`
            : 'Sin sesión'}
      </p>
    </main>
  )
}