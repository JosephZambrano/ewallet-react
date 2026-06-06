import { cn } from '../../lib/utils'

// Bloque gris animado que simula el contenido que va a aparecer
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'bg-[var(--color-bg-elevated)] rounded-lg animate-pulse',
        className
      )}
    />
  )
}

// Skeleton específico para las tarjetas de métricas
export function StatCardSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// Skeleton para filas de transacciones
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-3 w-32 mb-2" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <div className="text-right">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-2.5 w-12 ml-auto" />
      </div>
    </div>
  )
}