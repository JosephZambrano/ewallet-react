import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Target, Calendar } from 'lucide-react'
import {
  getScheduledItems, deleteScheduledItem, toggleScheduledItem,
  getSavingGoals, deleteSavingGoal, updateGoalProgress,
} from '../services/scheduled.service'
import { formatCurrency, cn } from '../lib/utils'
import { Button, Badge } from '../components/ui'
import { ScheduledModal }  from '../components/ScheduledModal'
import { SavingGoalModal } from '../components/SavingGoalModal'
import { ConfirmModal }    from '../components/ConfirmModal'

const FREQUENCY_LABELS = {
  weekly:   'Semanal',
  biweekly: 'Quincenal',
  monthly:  'Mensual',
  yearly:   'Anual',
}

const TYPE_CONFIG = {
  expense: { color: 'red',   label: 'Gasto',   emoji: '💸' },
  saving:  { color: 'blue',  label: 'Ahorro',  emoji: '🏦' },
  income:  { color: 'green', label: 'Ingreso', emoji: '💰' },
}

export function SchedulePage() {
  const [items,        setItems]        = useState([])
  const [goals,        setGoals]        = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingGoals, setLoadingGoals] = useState(true)

  const [showScheduledModal, setShowScheduledModal] = useState(false)
  const [showGoalModal,      setShowGoalModal]      = useState(false)
  const [itemToDelete,       setItemToDelete]       = useState(null)
  const [goalToDelete,       setGoalToDelete]       = useState(null)
  const [deleteLoading,      setDeleteLoading]      = useState(false)
  const [goalToUpdate,       setGoalToUpdate]       = useState(null)
  const [progressInput,      setProgressInput]      = useState('')
  const [progressLoading,    setProgressLoading]    = useState(false)
  const [activeTab,          setActiveTab]          = useState('scheduled')

  useEffect(() => {
    getScheduledItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoadingItems(false))

    getSavingGoals()
      .then(setGoals)
      .catch(console.error)
      .finally(() => setLoadingGoals(false))
  }, [])

  const handleItemCreated = (newItem) => setItems(prev => [newItem, ...prev])
  const handleGoalCreated = (newGoal) => setGoals(prev => [newGoal, ...prev])

  const handleToggle = async (item) => {
    try {
      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i)
      )
      await toggleScheduledItem(item.id, !item.active)
    } catch (err) {
      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, active: item.active } : i)
      )
      console.error('Error toggling:', err)
    }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return
    setDeleteLoading(true)
    try {
      await deleteScheduledItem(itemToDelete.id)
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id))
      setItemToDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return
    setDeleteLoading(true)
    try {
      await deleteSavingGoal(goalToDelete.id)
      setGoals(prev => prev.filter(g => g.id !== goalToDelete.id))
      setGoalToDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleProgressUpdate = async () => {
    if (!goalToUpdate || !progressInput) return
    const newAmount = parseFloat(progressInput)
    if (isNaN(newAmount) || newAmount < 0) return
    setProgressLoading(true)
    try {
      const newCurrent = Math.min(goalToUpdate.current + newAmount, goalToUpdate.target)
      await updateGoalProgress(goalToUpdate.id, newCurrent)
      setGoals(prev =>
        prev.map(g => g.id === goalToUpdate.id ? { ...g, current: newCurrent } : g)
      )
      setGoalToUpdate(null)
      setProgressInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setProgressLoading(false)
    }
  }

  const monthlyCommitted = items
    .filter(i => i.active && i.type === 'expense' && i.frequency === 'monthly')
    .reduce((acc, i) => acc + i.amount, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Programar</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-0.5">
            Recurrentes y metas de ahorro
          </p>
        </div>
        <Button onClick={() => activeTab === 'scheduled'
          ? setShowScheduledModal(true)
          : setShowGoalModal(true)
        }>
          <Plus size={15} />
          {activeTab === 'scheduled' ? 'Nuevo' : 'Nueva meta'}
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-[var(--color-txt-muted)] uppercase tracking-wide mb-2">Comprometido/mes</p>
          <p className="text-xl font-semibold font-mono text-[var(--color-accent-red)]">
            {formatCurrency(monthlyCommitted)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-[var(--color-txt-muted)] uppercase tracking-wide mb-2">Programados activos</p>
          <p className="text-xl font-semibold font-mono">{items.filter(i => i.active).length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-[var(--color-txt-muted)] uppercase tracking-wide mb-2">Metas en progreso</p>
          <p className="text-xl font-semibold font-mono text-[var(--color-accent-blue)]">
            {goals.filter(g => g.current < g.target).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-xl p-1 w-fit">
        {[
          { key: 'scheduled', label: 'Programados', icon: Calendar },
          { key: 'goals',     label: 'Metas',       icon: Target   },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === key
                ? 'bg-[var(--color-bg-elevated)] text-[var(--color-txt-primary)]'
                : 'text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)]'
            )}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Tab: Programados */}
      {activeTab === 'scheduled' && (
        <div className="flex flex-col gap-3">
          {loadingItems ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-elevated)] animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-[var(--color-bg-elevated)] rounded animate-pulse mb-2" />
                  <div className="h-2.5 w-24 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
              </div>
            ))
          ) : items.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="Sin programados"
              subtitle="Agrega gastos o ingresos recurrentes"
              onAction={() => setShowScheduledModal(true)}
              actionLabel="Agregar primero"
            />
          ) : (
            items.map(item => (
              <ScheduledItemCard
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item)}
                onDelete={() => setItemToDelete(item)}
              />
            ))
          )}
        </div>
      )}

      {/* Tab: Metas */}
      {activeTab === 'goals' && (
        <div className="flex flex-col gap-3">
          {loadingGoals ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card">
                <div className="h-3 w-36 bg-[var(--color-bg-elevated)] rounded animate-pulse mb-3" />
                <div className="h-2 w-full bg-[var(--color-bg-elevated)] rounded animate-pulse mb-2" />
                <div className="h-2.5 w-24 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
              </div>
            ))
          ) : goals.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title="Sin metas de ahorro"
              subtitle="Crea tu primera meta y empieza a ahorrar"
              onAction={() => setShowGoalModal(true)}
              actionLabel="Crear meta"
            />
          ) : (
            goals.map(goal => (
              <SavingGoalCard
                key={goal.id}
                goal={goal}
                onAddProgress={() => { setGoalToUpdate(goal); setProgressInput('') }}
                onDelete={() => setGoalToDelete(goal)}
              />
            ))
          )}
        </div>
      )}

      {/* Modales */}
      <ScheduledModal
        isOpen={showScheduledModal}
        onClose={() => setShowScheduledModal(false)}
        onCreated={handleItemCreated}
      />
      <SavingGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onCreated={handleGoalCreated}
      />
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        loading={deleteLoading}
        title="Eliminar programado"
        description={`¿Eliminar "${itemToDelete?.name}"?`}
      />
      <ConfirmModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteGoal}
        loading={deleteLoading}
        title="Eliminar meta"
        description={`¿Eliminar la meta "${goalToDelete?.name}"? Se perderá el progreso.`}
      />

      {/* Modal progreso */}
      {goalToUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setGoalToUpdate(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-1">Agregar ahorro</h3>
            <p className="text-sm text-[var(--color-txt-muted)] mb-4">Meta: {goalToUpdate.name}</p>
            <input
              className="input-base mb-4"
              type="number"
              step="0.01"
              min="0"
              placeholder="¿Cuánto ahorras hoy?"
              value={progressInput}
              onChange={e => setProgressInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setGoalToUpdate(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleProgressUpdate} disabled={progressLoading || !progressInput}>
                {progressLoading ? 'Guardando…' : 'Agregar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function ScheduledItemCard({ item, onToggle, onDelete }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.expense
  return (
    <div className={cn('card flex items-center gap-4 transition-opacity', !item.active && 'opacity-50')}>
      <div className="text-2xl flex-shrink-0">{config.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <Badge variant={config.color}>{config.label}</Badge>
          {!item.active && <Badge variant="gray">Pausado</Badge>}
        </div>
        <p className="text-xs text-[var(--color-txt-muted)]">
          {FREQUENCY_LABELS[item.frequency]} · Día {item.day_of_month} · {item.category}
        </p>
      </div>
      <p className="text-sm font-semibold font-mono flex-shrink-0">
        {formatCurrency(item.amount)}
      </p>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-txt-muted)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          {item.active
            ? <ToggleRight size={18} className="text-[var(--color-accent-green)]" />
            : <ToggleLeft  size={18} />
          }
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-txt-muted)] hover:bg-red-500/10 hover:text-[var(--color-accent-red)] transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function SavingGoalCard({ goal, onAddProgress, onDelete }) {
  const pct        = Math.min(Math.round((goal.current / goal.target) * 100), 100)
  const remaining  = goal.target - goal.current
  const isComplete = pct >= 100

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium">{goal.name}</p>
            {isComplete && <Badge variant="green">✓ Completada</Badge>}
          </div>
          {goal.deadline && (
            <p className="text-xs text-[var(--color-txt-muted)]">
              Límite: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('es-ES', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isComplete && (
            <Button variant="ghost" size="sm" onClick={onAddProgress}>
              <Plus size={13} /> Agregar
            </Button>
          )}
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-txt-muted)] hover:bg-red-500/10 hover:text-[var(--color-accent-red)] transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: goal.color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-txt-muted)]">
          {isComplete ? '🎉 Meta alcanzada' : `Falta ${formatCurrency(remaining)}`}
        </p>
        <p className="text-xs font-mono font-medium">
          <span style={{ color: goal.color }}>{formatCurrency(goal.current)}</span>
          <span className="text-[var(--color-txt-muted)]"> / {formatCurrency(goal.target)} ({pct}%)</span>
        </p>
      </div>
    </div>
  )
}

function EmptyState({ emoji, title, subtitle, onAction, actionLabel }) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-3xl">{emoji}</p>
      <p className="text-sm font-medium text-[var(--color-txt-secondary)]">{title}</p>
      <p className="text-xs text-[var(--color-txt-muted)]">{subtitle}</p>
      <Button variant="ghost" size="sm" onClick={onAction}>
        <Plus size={13} /> {actionLabel}
      </Button>
    </div>
  )
}