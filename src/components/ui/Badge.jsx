import { cn } from '../../lib/utils'

const variants = {
  blue:   'bg-blue-500/10 text-[var(--color-accent-blue)]',
  green:  'bg-emerald-500/10 text-[var(--color-accent-green)]',
  red:    'bg-red-500/10 text-[var(--color-accent-red)]',
  amber:  'bg-amber-500/10 text-[var(--color-accent-amber)]',
  purple: 'bg-violet-500/10 text-[var(--color-accent-purple)]',
  gray:   'bg-[var(--color-bg-elevated)] text-[var(--color-txt-muted)]',
}

export function Badge({ variant = 'gray', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}