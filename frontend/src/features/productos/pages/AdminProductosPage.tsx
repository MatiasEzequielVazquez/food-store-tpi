import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Skeleton from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import ProductoForm from '../components/ProductoForm'
import StockForm from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'

type ModalEstado =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | null

export default function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [modal, setModal] = useState<ModalEstado>(null)
  const [error, setError] = useState<string | null>(null)

  const abrir = (estado: ModalEstado) => {
    setError(null)
    setModal(estado)
  }

  const guardarProducto = async (valores: ProductoCreate) => {
    try {
      if (modal?.tipo === 'editar') {
        await actualizar.mutateAsync({ id: modal.producto.id, payload: valores })
      } else {
        await crear.mutateAsync(valores)
      }
      setModal(null)
    } catch (e) {
      setError(handleApiError(e))
    }
  }

  const guardarStock = async (valores: ProductoStockUpdate) => {
    if (modal?.tipo !== 'stock') return
    try {
      await actualizarStock.mutateAsync({ id: modal.producto.id, payload: valores })
      setModal(null)
    } catch (e) {
      setError(handleApiError(e))
    }
  }

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => `$${row.original.precio_base.toFixed(2)}`,
      },
      { accessorKey: 'stock', header: 'Stock' },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) => (row.original.disponible ? 'Sí' : 'No'),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="secundario" onClick={() => abrir({ tipo: 'editar', producto: row.original })}>
              Editar
            </Button>
            <Button variante="secundario" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button
              variante="peligro"
              onClick={() => {
                if (window.confirm(`¿Dar de baja "${row.original.nombre}"?`)) {
                  eliminar.mutate(row.original.id)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [eliminar],
  )

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button onClick={() => abrir({ tipo: 'crear' })} disabled={!categorias.data?.length}>
          Nuevo producto
        </Button>
      </div>

      {eliminar.isError && <EstadoError error={eliminar.error} />}

      {productos.isPending ? (
        <Skeleton cantidad={5} className="h-10" />
      ) : productos.isError ? (
        <EstadoError error={productos.error} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay productos cargados." />
      ) : (
        <TablaDatos data={productos.data.items} columns={columns} />
      )}

      <Modal
        titulo={modal?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        abierto={modal?.tipo === 'crear' || modal?.tipo === 'editar'}
        onCerrar={() => setModal(null)}
      >
        {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
          <ProductoForm
            key={modal.tipo === 'editar' ? modal.producto.id : 'nuevo'}
            producto={modal.tipo === 'editar' ? modal.producto : undefined}
            categorias={categorias.data ?? []}
            onSubmit={guardarProducto}
            error={error}
          />
        )}
      </Modal>

      <Modal
        titulo="Stock y disponibilidad"
        abierto={modal?.tipo === 'stock'}
        onCerrar={() => setModal(null)}
      >
        {modal?.tipo === 'stock' && (
          <StockForm
            key={modal.producto.id}
            producto={modal.producto}
            onSubmit={guardarStock}
            error={error}
          />
        )}
      </Modal>
    </section>
  )
}