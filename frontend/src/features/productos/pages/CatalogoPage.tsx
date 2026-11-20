import { useState } from 'react'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import Skeleton from '../../../shared/components/Skeleton'
import Button from '../../../shared/ui/Button'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMITE = 8

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  const productos = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / LIMITE) : 0

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Catálogo</h1>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setPagina(0)
          setSearch(texto.trim())
        }}
      >
        <input
          type="search"
          placeholder="Buscar por nombre"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setPagina(0)
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
      </form>

      {productos.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton cantidad={LIMITE} className="h-72" />
        </div>
      ) : productos.isError ? (
        <EstadoError error={productos.error} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No se encontraron productos." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}