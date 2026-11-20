import BadgeEstado from '../../../shared/ui/BadgeEstado'
import type { Pedido } from '../types/pedido'

export default function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Pedido #{pedido.id}</span>
        <BadgeEstado estado={pedido.estado} />
      </div>
      <p>Fecha: {new Date(pedido.created_at).toLocaleString()}</p>
      <p>Dirección: {pedido.direccion_entrega}</p>
      <p>Forma de pago: {pedido.forma_pago}</p>
      {pedido.notas && <p>Notas: {pedido.notas}</p>}
      <table className="min-w-full">
        <thead className="text-left text-gray-600">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1">Precio</th>
            <th className="py-1">Cant.</th>
            <th className="py-1">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((d) => (
            <tr key={d.producto_id} className="border-t border-gray-100">
              <td className="py-1">{d.nombre_producto}</td>
              <td className="py-1">${d.precio_unitario.toFixed(2)}</td>
              <td className="py-1">{d.cantidad}</td>
              <td className="py-1">${d.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-right font-bold">Total: ${pedido.total.toFixed(2)}</p>
    </div>
  )
}