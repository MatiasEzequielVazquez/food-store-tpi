import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  onSubmit: (valores: DatosCheckout) => Promise<void>
  error: string | null
}

const FORMAS_PAGO: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA']

export default function CheckoutForm({ onSubmit, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        direccion_entrega: value.direccion_entrega,
        forma_pago: value.forma_pago,
        notas: value.notas || null,
      })
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) =>
            value.length >= 5 && value.length <= 200
              ? undefined
              : 'La dirección debe tener entre 5 y 200 caracteres',
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Dirección de entrega"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              Forma de pago
            </label>
            <select
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {FORMAS_PAGO.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>
      <form.Field name="notas">
        {(field) => (
          <Input
            id={field.name}
            label="Notas (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}