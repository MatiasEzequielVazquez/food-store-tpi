import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import TablaDatos from '../../../shared/components/TablaDatos'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

interface PedidosTablaProps {
  pedidos: Pedido[]
  onCambiarEstado: (id: number, estado: EstadoPedido) => void
  deshabilitado: boolean
}

export default function PedidosTabla({ pedidos, onCambiarEstado, deshabilitado }: PedidosTablaProps) {
  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'usuario_id', header: 'Usuario' },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      { accessorKey: 'forma_pago', header: 'Pago' },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        // Solo se ofrecen las transiciones válidas de la máquina de estados.
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {TRANSICIONES[row.original.estado].map((destino) => (
              <Button
                key={destino}
                variante={destino === 'CANCELADO' ? 'peligro' : 'primario'}
                disabled={deshabilitado}
                onClick={() => onCambiarEstado(row.original.id, destino)}
              >
                {destino === 'CANCELADO' ? 'Cancelar' : `Pasar a ${destino}`}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [onCambiarEstado, deshabilitado],
  )

  return <TablaDatos data={pedidos} columns={columns} paginar={false} />
}