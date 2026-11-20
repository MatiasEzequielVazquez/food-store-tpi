import { Link } from 'react-router-dom'
import Card from '../../../shared/ui/Card'

export default function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md text-center">
      <h1 className="mb-2 text-xl font-semibold">Sin permiso</h1>
      <p className="mb-4 text-sm text-gray-600">No tenés permisos para acceder a esta sección.</p>
      <Link to="/" className="text-orange-700 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  )
}