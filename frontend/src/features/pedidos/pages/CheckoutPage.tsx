import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Card from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="No hay productos en el carrito.">
        <Link to="/" className="text-orange-700 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  const confirmar = async (datos: DatosCheckout) => {
    setError(null)
    try {
      await crearPedido.mutateAsync({
        ...datos,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      vaciar()
      navigate('/mis-pedidos')
    } catch (e) {
      setError(handleApiError(e))
    }
  }

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-semibold">Confirmar pedido</h1>
      <Card>
        <ul className="mb-3 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-1">
              <span>
                {i.cantidad} x {i.nombre}
              </span>
              <span>${(i.precio_unitario * i.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-right font-bold">Total: ${total().toFixed(2)}</p>
      </Card>
      <Card>
        <CheckoutForm onSubmit={confirmar} error={error} />
      </Card>
    </section>
  )
}