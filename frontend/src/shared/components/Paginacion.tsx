import Button from '../ui/Button'

interface PaginacionProps {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

/** pagina es base 0: skip = pagina × limit. */
export default function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button variante="secundario" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        disabled={pagina + 1 >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </div>
  )
}