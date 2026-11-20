import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import Input from '../../../shared/ui/Input'
import type { UserCreate } from '../../usuarios/types/usuario'
import { register } from '../api/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const registro = useMutation({
    mutationFn: (payload: UserCreate) => register(payload),
    onSuccess: () => navigate('/login'),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      await registro.mutateAsync(value).catch(() => undefined)
    },
  })

  return (
    <Card className="mx-auto max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => (value.trim() ? undefined : 'El usuario es obligatorio'),
          }}
        >
          {(field) => (
            <Input
              id={field.name}
              label="Usuario"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field
          name="full_name"
          validators={{
            onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio'),
          }}
        >
          {(field) => (
            <Input
              id={field.name}
              label="Nombre completo"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (EMAIL_REGEX.test(value) ? undefined : 'Email inválido'),
          }}
        >
          {(field) => (
            <Input
              id={field.name}
              label="Email"
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length >= 8 ? undefined : 'La contraseña debe tener al menos 8 caracteres',
          }}
        >
          {(field) => (
            <Input
              id={field.name}
              label="Contraseña"
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        {registro.isError && (
          <p className="text-sm text-red-600">{handleApiError(registro.error)}</p>
        )}
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-orange-700 hover:underline">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}