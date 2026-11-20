import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import ResumenCard from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export default function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Resumen</h1>
      {resumen.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton cantidad={6} className="h-24" />
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={String(resumen.data.pendientes)} />
          <ResumenCard titulo="En preparación" valor={String(resumen.data.en_preparacion)} />
          <ResumenCard titulo="Entregados" valor={String(resumen.data.entregados)} />
          <ResumenCard titulo="Cancelados" valor={String(resumen.data.cancelados)} />
          <ResumenCard titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={`$${resumen.data.ingresos_entregados.toFixed(2)}`}
          />
        </div>
      )}
    </section>
  )
}