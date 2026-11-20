import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  errores?: ReadonlyArray<unknown>
}

export default function Input({ label, errores = [], id, className = '', ...props }: InputProps) {
  const mensaje = errores.filter(Boolean).map(String).join(', ')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none ${className}`}
        {...props}
      />
      {mensaje && <span className="text-xs text-red-600">{mensaje}</span>}
    </div>
  )
}