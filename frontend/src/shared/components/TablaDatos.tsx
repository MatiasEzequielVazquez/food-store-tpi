import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import Paginacion from './Paginacion'

interface TablaDatosProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  /** Paginación del lado del cliente con TanStack Table. */
  paginar?: boolean
  tamanioPagina?: number
}

export default function TablaDatos<T>({
  data,
  columns,
  paginar = true,
  tamanioPagina = 10,
}: TablaDatosProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(paginar ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageIndex: 0, pageSize: tamanioPagina } },
  })

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 font-semibold text-gray-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginar && (
        <Paginacion
          pagina={table.getState().pagination.pageIndex}
          totalPaginas={table.getPageCount()}
          onCambiar={(p) => table.setPageIndex(p)}
        />
      )}
    </div>
  )
}