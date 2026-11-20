import { handleApiError } from '../api/handleApiError'

export default function EstadoError({ error }: { error: unknown }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {handleApiError(error)}
    </div>
  )
}