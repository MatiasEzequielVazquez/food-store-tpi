import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export default function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const vendible = producto.disponible && producto.stock > 0

  return (
    <Card className="flex flex-col gap-2">
      {producto.imagen_url && (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-36 w-full rounded-md object-cover"
        />
      )}
      <span className="text-xs text-gray-500">{producto.categoria.nombre}</span>
      <h3 className="font-semibold">{producto.nombre}</h3>
      {producto.descripcion && <p className="text-sm text-gray-600">{producto.descripcion}</p>}
      <div className="mt-auto flex items-center justify-between">
        <span className="font-bold">${producto.precio_base.toFixed(2)}</span>
        <span className="text-xs text-gray-500">
          {vendible ? `Stock: ${producto.stock}` : 'Sin stock / no disponible'}
        </span>
      </div>
      <Button
        disabled={!vendible}
        onClick={() =>
          agregar({
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
          })
        }
      >
        Agregar al carrito
      </Button>
    </Card>
  )
}