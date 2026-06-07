import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, SlidersHorizontal, Trash2, Pencil } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useDebounce }     from '../hooks/useDebounce'
import { deleteTransaction } from '../services/transactions.service'
import { formatCurrency, cn } from '../lib/utils'
import { Button, Badge } from '../components/ui'
import { TransactionModal } from '../components/TransactionModal'
import { ConfirmModal }     from '../components/ConfirmModal'

const categoryConfig = {
  
  'Supermercado':    { emoji: '🛒', color: 'blue'   },
  'Comida':          { emoji: '🍔', color: 'amber'  },
  'Transporte':      { emoji: '🚗', color: 'blue'   },
  'Salud':           { emoji: '💊', color: 'purple' },
  'Suscripciones':   { emoji: '📱', color: 'red'    },
  'Entretenimiento': { emoji: '🎬', color: 'amber'  },
  'Servicios':       { emoji: '💡', color: 'blue'   },
  'Salario':         { emoji: '💼', color: 'green'  },
  'Freelance':       { emoji: '💻', color: 'blue'   },
  'Inversiones':     { emoji: '📈', color: 'green'  },
  'Educación':       { emoji: '📚', color: 'purple' },
  'Regalo':          { emoji: '🎁', color: 'amber'  },
  'Otros':           { emoji: '💳', color: 'gray'   },
}

const CATEGORIES_LIST = Object.keys(categoryConfig)

function groupByDate(transactions) {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  return transactions.reduce((groups, tx) => {
    let label
    if (tx.date === today)          label = 'Hoy'
    else if (tx.date === yesterday) label = 'Ayer'
    else {
      label = new Date(tx.date + 'T00:00:00').toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    }
    if (!groups[label]) groups[label] = []
    groups[label].push(tx)
    return groups
  }, {})
}

export function MovementsPage() {
  const {
    filtered, loading,
    filters, setFilter,
    addTransaction, removeTransaction, updateTransaction,
  } = useTransactions()

  const [showAddModal,  setShowAddModal]  = useState(false)
  const [txToEdit,      setTxToEdit]      = useState(null)
  const [txToDelete,    setTxToDelete]    = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchInput,   setSearchInput]   = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setFilter('search', debouncedSearch)
  }, [debouncedSearch])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    setFilter('search', e.target.value)
  }

  const handleCreated = (newTx) => {
    addTransaction(newTx)
  }

  const handleUpdated = (updatedTx) => {
    updateTransaction(updatedTx)
  }

  const handleDeleteConfirm = async () => {
    if (!txToDelete) return
    setDeleteLoading(true)
    try {
      await deleteTransaction(txToDelete.id)
      removeTransaction(txToDelete.id)
      setTxToDelete(null)
    } catch (err) {
      console.error('Error eliminando:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Movimientos</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-0.5">
            {filtered.length} transacciones
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Nueva
        </Button>
      </div>

      {/* Búsqueda + filtros */}
      <div className="card flex flex-col gap-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-txt-muted)]"
          />
          <input
            className="input-base pl-9"
            placeholder="Buscar por nombre o categoría…"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <SlidersHorizontal size={13} className="text-[var(--color-txt-muted)] flex-shrink-0" />
          {[
            { value: 'all',     label: 'Todos'    },
            { value: 'income',  label: 'Ingresos' },
            { value: 'expense', label: 'Gastos'   },
          ].map(opt => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={filters.type === opt.value}
              onClick={() => setFilter('type', opt.value)}
            />
          ))}

          <span className="w-px h-4 bg-[var(--color-border-strong)]" />

          <FilterChip
            label="Todas las categorías"
            active={filters.category === 'all'}
            onClick={() => setFilter('category', 'all')}
          />
          {CATEGORIES_LIST.slice(0, 5).map(cat => (
            <FilterChip
              key={cat}
              label={cat}
              active={filters.category === cat}
              onClick={() => setFilter('category', cat)}
            />
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-1">
        {loading ? (
          <div className="card flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-elevated)] animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-36 bg-[var(--color-bg-elevated)] rounded animate-pulse mb-2" />
                  <div className="h-2.5 w-24 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-3xl">🔍</p>
            <p className="text-sm font-medium text-[var(--color-txt-secondary)]">
              No hay transacciones
            </p>
            <p className="text-xs text-[var(--color-txt-muted)]">
              Intenta cambiar los filtros o agrega una nueva
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 py-2 px-1">
                <p className="text-xs font-semibold text-[var(--color-txt-muted)] uppercase tracking-wide">
                  {dateLabel}
                </p>
                <div className="flex-1 h-px bg-[var(--color-border-default)]" />
                <p className={cn(
                  'text-xs font-mono font-medium',
                  txs.reduce((a, t) => a + t.amount, 0) >= 0
                    ? 'text-[var(--color-accent-green)]'
                    : 'text-[var(--color-txt-muted)]'
                )}>
                  {txs.reduce((a, t) => a + t.amount, 0) >= 0 ? '+' : ''}
                  {formatCurrency(txs.reduce((a, t) => a + t.amount, 0))}
                </p>
              </div>

              <div className="card p-2">
                {txs.map((tx, idx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    isLast={idx === txs.length - 1}
                    onEdit={() => setTxToEdit(tx)}
                    onDelete={() => setTxToDelete(tx)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales */}
      <TransactionModal
        isOpen={showAddModal || !!txToEdit}
        onClose={() => { setShowAddModal(false); setTxToEdit(null) }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        transaction={txToEdit}
      />

      <ConfirmModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Eliminar transacción"
        description={`¿Eliminar "${txToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
        active
          ? 'bg-blue-500/12 border-blue-500/35 text-[var(--color-accent-blue)]'
          : 'border-[var(--color-border-strong)] text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)]'
      )}
    >
      {label}
    </button>
  )
}

function TransactionRow({ tx, isLast, onDelete, onEdit }) {
  const config   = categoryConfig[tx.category] || { emoji: '💳', color: 'gray' }
  const isIncome = tx.type === 'income'

  const bgMap = {
    amber:  'rgba(245,158,11,0.1)',
    blue:   'rgba(59,130,246,0.1)',
    purple: 'rgba(139,92,246,0.1)',
    red:    'rgba(239,68,68,0.1)',
    green:  'rgba(16,185,129,0.1)',
    gray:   'rgba(71,85,105,0.12)',
  }

  return (
    <div className={cn(
      'group flex items-center gap-3 px-3 py-2.5 rounded-xl',
      'hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer',
      !isLast && 'border-b border-[var(--color-border-default)]'
    )}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: bgMap[config.color] }}
      >
        {config.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={config.color}>{tx.category}</Badge>
          <span className="text-[11px] text-[var(--color-txt-muted)]">{tx.date}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <p className={cn(
          'text-sm font-semibold font-mono mr-1',
          isIncome ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-txt-secondary)]'
        )}>
          {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
        </p>

        <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-txt-muted)] hover:bg-blue-500/10 hover:text-[var(--color-accent-blue)] transition-all"
          >
            <Pencil size={13} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-txt-muted)] hover:bg-red-500/10 hover:text-[var(--color-accent-red)] transition-all"
          >
            <Trash2 size={13} />
          </button>
      </div>
    </div>
  )
}