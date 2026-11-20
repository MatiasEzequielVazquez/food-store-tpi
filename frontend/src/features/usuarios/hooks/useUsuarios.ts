import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'

const KEY = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: KEY, queryFn: getUsuarios })
}

export function useActivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}