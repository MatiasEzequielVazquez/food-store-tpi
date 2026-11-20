import { Link, useNavigate } from 'react-router-dom'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="text-orange-700 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Carrito</h1>
      <Card>
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="py-2">Producto</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Cantidad</th>
              <th className="py-2">Subtotal</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.producto_id} className="border-t border-gray-100">
                <td className="py-2">{item.nombre}</td>
                <td className="py-2">${item.precio_unitario.toFixed(2)}</td>
                <td className="py-2">
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.producto_id, Number(e.target.value))}
                    className="w-20 rounded-md border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="py-2">${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                <td className="py-2 text-right">
                  <Button variante="secundario" onClick={() => quitar(item.producto_id)}>
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between">
          <Button variante="secundario" onClick={vaciar}>
            Vaciar carrito
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">Total: ${total().toFixed(2)}</span>
            <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
          </div>
        </div>
      </Card>
    </section>
  )
}