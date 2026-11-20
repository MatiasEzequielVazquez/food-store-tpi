import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Skeleton from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import CategoriaForm from '../components/CategoriaForm'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria'

type ModalEstado = { tipo: 'crear' } | { tipo: 'editar'; categoria: Categoria } | null

export default function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [modal, setModal] = useState<ModalEstado>(null)
  const [error, setError] = useState<string | null>(null)

  const abrir = (estado: ModalEstado) => {
    setError(null)
    setModal(estado)
  }

  const guardar = async (valores: CategoriaCreate) => {
    try {
      if (modal?.tipo === 'editar') {
        await actualizar.mutateAsync({ id: modal.categoria.id, payload: valores })
      } else {
        await crear.mutateAsync(valores)
      }
      setModal(null)
    } catch (e) {
      setError(handleApiError(e))
    }
  }

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => row.original.descripcion ?? '-',
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variante="secundario"
              onClick={() => abrir({ tipo: 'editar', categoria: row.original })}
            >
              Editar
            </Button>
            <Button
              variante="peligro"
              onClick={() => {
                if (window.confirm(`¿Dar de baja la categoría "${row.original.nombre}"?`)) {
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
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <Button onClick={() => abrir({ tipo: 'crear' })}>Nueva categoría</Button>
      </div>

      {eliminar.isError && <EstadoError error={eliminar.error} />}

      {categorias.isPending ? (
        <Skeleton cantidad={4} className="h-10" />
      ) : categorias.isError ? (
        <EstadoError error={categorias.error} />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio mensaje="No hay categorías cargadas." />
      ) : (
        <TablaDatos data={categorias.data} columns={columns} />
      )}

      <Modal
        titulo={modal?.tipo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        abierto={modal !== null}
        onCerrar={() => setModal(null)}
      >
        {modal && (
          <CategoriaForm
            key={modal.tipo === 'editar' ? modal.categoria.id : 'nueva'}
            categoria={modal.tipo === 'editar' ? modal.categoria : undefined}
            onSubmit={guardar}
            error={error}
          />
        )}
      </Modal>
    </section>
  )
}