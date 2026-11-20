import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  producto?: Producto
  categorias: Categoria[]
  onSubmit: (valores: ProductoCreate) => Promise<void>
  error: string | null
}

export default function ProductoForm({ producto, categorias, onSubmit, error }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        descripcion: value.descripcion || null,
        imagen_url: value.imagen_url || null,
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
        name="nombre"
        validators={{
          onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio'),
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
      <form.Field
        name="precio_base"
        validators={{
          onChange: ({ value }) =>
            Number.isFinite(value) && value >= 0 ? undefined : 'El precio debe ser mayor o igual a 0',
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Precio base"
            type="number"
            step="0.01"
            min={0}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            id={field.name}
            label="URL de imagen"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
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
      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value > 0 ? undefined : 'Seleccioná una categoría'),
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {field.state.meta.errors.length > 0 && (
              <span className="text-xs text-red-600">
                {field.state.meta.errors.filter(Boolean).map(String).join(', ')}
              </span>
            )}
          </div>
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