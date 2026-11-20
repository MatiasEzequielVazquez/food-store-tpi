import { useState } from 'react'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import Skeleton from '../../../shared/components/Skeleton'
import PedidosTabla from '../components/PedidosTabla'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido } from '../types/pedido'

const LIMITE = 20
const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export default function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / LIMITE) : 0

  const onCambiarEstado = (id: number, nuevo: EstadoPedido) => {
    const mensaje = nuevo === 'CANCELADO' ? `¿Cancelar el pedido #${id}?` : `¿Pasar el pedido #${id} a ${nuevo}?`
    if (window.confirm(mensaje)) {
      cambiarEstado.mutate({ id, estado: nuevo })
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(e) => {
            setPagina(0)
            setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {cambiarEstado.isError && <EstadoError error={cambiarEstado.error} />}

      {pedidos.isPending ? (
        <Skeleton cantidad={5} className="h-10" />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <>
          <PedidosTabla
            pedidos={pedidos.data.items}
            onCambiarEstado={onCambiarEstado}
            deshabilitado={cambiarEstado.isPending}
          />
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}