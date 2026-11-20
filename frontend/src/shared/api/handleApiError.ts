import axios from 'axios'

interface ErrorValidacion {
  msg: string
}

function esErrorValidacion(valor: unknown): valor is ErrorValidacion {
  return typeof valor === 'object' && valor !== null && 'msg' in valor
}

/** Convierte el detail de la API en un mensaje para la pantalla. */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor'
    }
    const data: unknown = error.response.data
    if (typeof data === 'object' && data !== null && 'detail' in data) {
      const detail = (data as { detail: unknown }).detail
      if (typeof detail === 'string') {
        return detail
      }
      if (Array.isArray(detail)) {
        return detail
          .map((d: unknown) => (esErrorValidacion(d) ? d.msg : String(d)))
          .join('. ')
      }
    }
    return `Error ${error.response.status}`
  }
  return 'Ocurrió un error inesperado'
}