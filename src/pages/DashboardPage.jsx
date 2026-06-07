import { useMemo, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, cn } from '../lib/utils'
import {
  calcBalance, calcMonthlyIncome,
  calcMonthlyExpenses, calcCategoryBreakdown, calcMonthlyChart
} from '../lib/calculations'
import { IncomeExpenseBarChart } from '../components/charts/BarChart'
import { ExpenseDonutChart }     from '../components/charts/DonutChart'
import { StatCardSkeleton, TransactionRowSkeleton } from '../components/ui'

const categoryIcons = {
  'Supermercado':    { icon: '🛒', bg: 'rgba(16,185,129,0.1)'  },
  'Comida':          { icon: '🍔', bg: 'rgba(245,158,11,0.1)'  },
  'Transporte':      { icon: '🚗', bg: 'rgba(59,130,246,0.1)'  },
  'Salud':           { icon: '💊', bg: 'rgba(139,92,246,0.1)'  },
  'Suscripciones':   { icon: '📱', bg: 'rgba(239,68,68,0.1)'   },
  'Entretenimiento': { icon: '🎬', bg: 'rgba(245,158,11,0.1)'  }, 
  'Servicios':       { icon: '💡', bg: 'rgba(6,182,212,0.1)'   },
  'Salario':         { icon: '💼', bg: 'rgba(16,185,129,0.1)'  },
  'Freelance':       { icon: '💻', bg: 'rgba(59,130,246,0.1)'  },
}
const defaultIcon = { icon: '💳', bg: 'rgba(71,85,105,0.15)' }

function StatCard({ label, value, delta, deltaLabel, icon: Icon, iconColor, loading }) {
  if (loading) return <StatCardSkeleton />

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[var(--color-txt-muted)] uppercase tracking-wide">
          {label}
        </p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}18` }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight font-mono mb-1.5">
        {formatCurrency(value)}
      </p>
      {delta !== undefined && (
        <p className={cn(
          'text-xs flex items-center gap-1',
          delta >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'
        )}>
          <TrendingUp size={11} />
          {deltaLabel}
        </p>
      )}
    </div>
  )
}

function TransactionRow({ tx }) {
  const { icon, bg } = categoryIcons[tx.category] || defaultIcon
  const isIncome = tx.type === 'income'

  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: bg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-txt-primary)] truncate">
          {tx.name}
        </p>
        <p className="text-xs text-[var(--color-txt-muted)] mt-0.5">
          {tx.category} · {tx.date}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          'text-sm font-semibold font-mono',
          isIncome ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-txt-secondary)]'
        )}>
          {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
        </p>
        <p className="text-[11px] text-[var(--color-txt-muted)] mt-0.5">
          {isIncome ? 'Ingreso' : 'Gasto'}
        </p>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function DashboardPage() {
  // ✅ Una sola declaración de cada variable
  const { transactions, loading } = useTransactions()

  // ✅ error como estado simple, sin setter porque no lo usamos aún
  const [error] = useState(null)

  const balance    = useMemo(() => calcBalance(transactions),           [transactions])
  const income     = useMemo(() => calcMonthlyIncome(transactions),     [transactions])
  const expenses   = useMemo(() => calcMonthlyExpenses(transactions),   [transactions])
  const chartData  = useMemo(() => calcMonthlyChart(transactions),      [transactions])
  const categories = useMemo(() => calcCategoryBreakdown(transactions), [transactions])

  const recentTxs = transactions.slice(0, 5)

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--color-accent-red)]">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-0.5">
            {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Saldo total"      value={balance}   icon={Wallet}          iconColor="#3B82F6" loading={loading} />
        <StatCard label="Ingresos del mes" value={income}    icon={ArrowDownCircle} iconColor="#10B981" deltaLabel="Este mes" delta={1}  loading={loading} />
        <StatCard label="Gastos del mes"   value={expenses}  icon={ArrowUpCircle}   iconColor="#EF4444" deltaLabel="Este mes" delta={-1} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Ingresos vs Gastos</h2>
            <div className="flex items-center gap-3 text-xs text-[var(--color-txt-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#10B981] inline-block" />Ingresos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#EF4444] inline-block" />Gastos
              </span>
            </div>
          </div>
          <div className="h-52">
            {loading
              ? <div className="h-full bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
              : <IncomeExpenseBarChart data={chartData} />
            }
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Gastos por categoría</h2>
          <div className="flex gap-4 items-center">
            <div className="h-40 flex-1">
              {loading
                ? <div className="h-full bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
                : <ExpenseDonutChart data={categories} />
              }
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm bg-[var(--color-bg-elevated)] animate-pulse" />
                      <div className="h-2.5 w-20 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                    </div>
                  ))
                : categories.map(cat => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-xs text-[var(--color-txt-secondary)] truncate">{cat.name}</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Movimientos recientes</h2>
          <a href="/movements" className="text-xs text-[var(--color-accent-blue)] hover:underline">
            Ver todos
          </a>
        </div>
        <div className="flex flex-col">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <TransactionRowSkeleton key={i} />)
            : recentTxs.map(tx => <TransactionRow key={tx.id} tx={tx} />)
          }
        </div>
      </div>

    </div>
  )
}