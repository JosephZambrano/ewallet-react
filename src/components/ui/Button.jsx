// cn es nuestra función utilitaria para unir clases condicionalmente
import { cn } from '../../lib/utils'

// Definimos las variantes visuales del botón como un objeto
// Esto evita tener ifs/elses y hace el código más fácil de mantener
const variants = {
  primary: 'bg-[var(--color-accent-blue)] text-white hover:opacity-90',
  ghost:   'bg-[var(--color-bg-tertiary)] text-[var(--color-txt-secondary)] border border-[var(--color-border-strong)] hover:text-[var(--color-txt-primary)]',
  danger:  'bg-[var(--color-accent-red)] text-white hover:opacity-90',
  outline: 'border border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] hover:bg-[var(--color-bg-tertiary)]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

// Las props que acepta el botón:
// - variant: qué estilo visual usar (default: 'primary')
// - size: qué tamaño usar (default: 'md')
// - className: clases extra que quiera pasar quien lo use
// - children: el contenido dentro del botón (texto, iconos, etc.)
// - ...props: cualquier otra prop de HTML nativa (onClick, type, disabled, etc.)
//             el spread ...props la pasa directo al <button>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        // Clases base que siempre aplican
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Clases que dependen de las props
        variants[variant],
        sizes[size],
        // Clases extra que pase el usuario del componente
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}