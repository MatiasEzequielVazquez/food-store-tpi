import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../features/auth/api/auth'
import type { Credenciales, UsuarioSesion } from '../features/auth/types/auth'
import type { UserPublic } from '../features/usuarios/types/usuario'

interface AuthState {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (credenciales: Credenciales) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

function aSesion(usuario: UserPublic): UsuarioSesion {
  return { full_name: usuario.full_name, email: usuario.email, role: usuario.role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        // El JWT queda en la cookie HttpOnly; el frontend solo pide el perfil.
        await authApi.login(credenciales)
        const usuario = await authApi.getMe()
        set({ usuario: aSesion(usuario) })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.getMe()
          set({ usuario: aSesion(usuario) })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },
    }),
    {
      name: 'food-store-auth',
      // Solo se persiste el usuario; nunca el token.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)