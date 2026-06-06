import { cn } from '../../lib/utils'

// forwardRef permite que el componente padre acceda al elemento <input> del DOM
// React Hook Form lo necesita para registrar los inputs en el formulario
import { forwardRef } from 'react'

// forwardRef recibe (props, ref) en lugar de solo (props)
export const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, rightIcon, className, ...props },
  ref
) {
  return (
    // El wrapper de todo el campo
    <div className="flex flex-col gap-1.5">

      {/* Label: solo se renderiza si se pasa la prop label */}
      {label && (
        <label className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Contenedor del input con posicionamiento para los íconos */}
      <div className="relative">

        {/* Ícono izquierdo opcional */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-txt-muted)]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={cn(
            'input-base',
            leftIcon && 'pl-9',   // más padding si hay ícono izquierdo
            rightIcon && 'pr-9',  // más padding si hay ícono derecho
            // Si hay error, cambia el borde a rojo
            error && 'border-[var(--color-accent-red)] focus:border-[var(--color-accent-red)]',
            className
          )}
          {...props}
        />

        {/* Ícono derecho opcional */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-txt-muted)]">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-xs text-[var(--color-accent-red)]">{error}</p>
      )}

      {/* Texto de ayuda (hint) — solo si no hay error */}
      {hint && !error && (
        <p className="text-xs text-[var(--color-txt-muted)]">{hint}</p>
      )}
    </div>
  )
})