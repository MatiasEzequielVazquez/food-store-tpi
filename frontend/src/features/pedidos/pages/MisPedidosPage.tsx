import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import Skeleton from '../../../shared/components/Skeleton'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import Modal from '../../../shared/ui/Modal'
import PedidoDetalle from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const LIMITE = 10

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE })
  const cancelar = useCancelarPedido()

  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / LIMITE) : 0

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Mis pedidos</h1>
      {cancelar.isError && (
        <p className="text-sm text-red-600">{handleApiError(cancelar.error)}</p>
      )}

      {pedidos.isPending ? (
        <Skeleton cantidad={3} className="h-16" />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste pedidos." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pedidos.data.items.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold">Pedido #{p.id}</span>
                  <span className="text-gray-600">{new Date(p.created_at).toLocaleString()}</span>
                </div>
                <BadgeEstado estado={p.estado} />
                <span className="font-bold">${p.total.toFixed(2)}</span>
                <div className="flex gap-2">
                  <Button variante="secundario" onClick={() => setDetalle(p)}>
                    Ver detalle
                  </Button>
                  {p.estado === 'PENDIENTE' && (
                    <Button
                      variante="peligro"
                      disabled={cancelar.isPending}
                      onClick={() => {
                        if (window.confirm(`¿Cancelar el pedido #${p.id}?`)) {
                          cancelar.mutate(p.id)
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}

      <Modal titulo="Detalle del pedido" abierto={detalle !== null} onCerrar={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>
    </section>
  )
}