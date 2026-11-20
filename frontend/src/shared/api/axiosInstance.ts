import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const url = error.config?.url ?? ''
      const status = error.response.status
      const data: unknown = error.response.data
      const detail =
        typeof data === 'object' && data !== null && 'detail' in data
          ? (data as { detail: unknown }).detail
          : undefined
      const esLoginOMe = url.includes('/auth/token') || url.includes('/auth/me')

      // Sesión inválida o cuenta desactivada: se limpia el authStore.
      // ProtectedRoute redirige a /login al quedar sin usuario.
      if ((status === 401 && !esLoginOMe) || (status === 400 && detail === CUENTA_DESACTIVADA)) {
        useAuthStore.setState({ usuario: null })
      }
    }
    return Promise.reject(error)
  },
)