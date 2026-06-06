import { cn } from '../../lib/utils'

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        // El truco del spinner: borde en todos lados pero transparente,
        // excepto un lado que tiene color — al rotar, parece que "gira"
        'rounded-full border-[var(--color-bg-elevated)]',
        'border-t-[var(--color-accent-blue)]',
        'animate-spin',
        sizes[size],
        className
      )}
    />
  )
}