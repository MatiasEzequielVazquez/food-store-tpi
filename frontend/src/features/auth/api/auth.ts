import { api } from '../../../shared/api/axiosInstance'
import type { UserCreate, UserPublic } from '../../usuarios/types/usuario'
import type { Credenciales, MensajeResponse } from '../types/auth'

export async function login({ username, password }: Credenciales): Promise<MensajeResponse> {
  // Formulario OAuth2: application/x-www-form-urlencoded.
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const { data } = await api.post<MensajeResponse>('/auth/token', form)
  return data
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await api.post<MensajeResponse>('/auth/logout')
  return data
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>('/auth/me')
  return data
}

export async function register(payload: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>('/auth/register', payload)
  return data
}