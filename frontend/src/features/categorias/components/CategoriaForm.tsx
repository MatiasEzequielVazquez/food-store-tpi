import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import type { Categoria, CategoriaCreate } from '../types/categoria'

interface CategoriaFormProps {
  categoria?: Categoria
  onSubmit: (valores: CategoriaCreate) => Promise<void>
  error: string | null
}

export default function CategoriaForm({ categoria, onSubmit, error }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ nombre: value.nombre, descripcion: value.descripcion || null })
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
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            value.length >= 2 && value.length <= 100
              ? undefined
              : 'El nombre debe tener entre 2 y 100 caracteres',
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Input
            id={field.name}
            label="Descripción"
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
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}