import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos'
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto'

const KEY = ['productos'] as const

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [...KEY, filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useCrearProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductoCreate) => crearProducto(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdate }) =>
      actualizarProducto(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useActualizarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoStockUpdate }) =>
      actualizarStock(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}