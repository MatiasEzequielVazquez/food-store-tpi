import type { UserPublic } from '../../usuarios/types/usuario'

/** Datos del usuario que guarda el authStore: nombre, email y rol. Nunca el token. */
export type UsuarioSesion = Pick<UserPublic, 'full_name' | 'email' | 'role'>

export interface Credenciales {
  username: string
  password: string
}

export interface MensajeResponse {
  message: string
}