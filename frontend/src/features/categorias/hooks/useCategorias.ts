import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from '../api/categorias'
import type { CategoriaCreate, CategoriaUpdate } from '../types/categoria'

const KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: KEY, queryFn: getCategorias })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoriaCreate) => crearCategoria(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaUpdate }) =>
      actualizarCategoria(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: KEY })
      // Los productos muestran el nombre de su categoría.
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}