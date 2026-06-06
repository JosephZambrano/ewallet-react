import { getInitials } from '../../lib/utils'
import { cn } from '../../lib/utils'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
}

export function Avatar({ name, src, size = 'md', className }) {
  // Si hay una URL de imagen, mostramos la foto
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  // Si no hay foto, mostramos las iniciales del nombre
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        // Gradiente con las variables CSS
        'bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]',
        'text-white',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}