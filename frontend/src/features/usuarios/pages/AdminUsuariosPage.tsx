import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Skeleton from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import Button from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '../types/usuario'

export default function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const emailSesion = useAuthStore((s) => s.usuario?.email)

  const columns = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Rol' },
      {
        id: 'estado',
        header: 'Estado',
        cell: ({ row }) => (row.original.disabled ? 'Desactivado' : 'Activo'),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const usuario = row.original
          // El botón Desactivar no se muestra en la fila del usuario de la sesión.
          if (usuario.email === emailSesion) return null
          return usuario.disabled ? (
            <Button variante="secundario" onClick={() => activar.mutate(usuario.id)}>
              Activar
            </Button>
          ) : (
            <Button variante="peligro" onClick={() => desactivar.mutate(usuario.id)}>
              Desactivar
            </Button>
          )
        },
      },
    ],
    [activar, desactivar, emailSesion],
  )

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      {activar.isError && <EstadoError error={activar.error} />}
      {desactivar.isError && <EstadoError error={desactivar.error} />}
      {usuarios.isPending ? (
        <Skeleton cantidad={4} className="h-10" />
      ) : usuarios.isError ? (
        <EstadoError error={usuarios.error} />
      ) : usuarios.data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios." />
      ) : (
        <TablaDatos data={usuarios.data} columns={columns} />
      )}
    </section>
  )
}