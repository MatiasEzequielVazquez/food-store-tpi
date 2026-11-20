import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onSubmit: (valores: ProductoStockUpdate) => Promise<void>
  error: string | null
}

export default function StockForm({ producto, onSubmit, error }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isInteger(value) && value >= 0 ? undefined : 'El stock debe ser un entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Stock"
            type="number"
            step="1"
            min={0}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible
          </label>
        )}
      </form.Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}