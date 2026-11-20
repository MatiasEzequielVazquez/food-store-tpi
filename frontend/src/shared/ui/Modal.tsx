import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  abierto: boolean
  onCerrar: () => void
  children: ReactNode
}

export default function Modal({ titulo, abierto, onCerrar, children }: ModalProps) {
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}