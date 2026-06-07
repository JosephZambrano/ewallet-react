import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Printer } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, cn } from '../lib/utils'
import {
  calcMonthMetrics, calcCategoryBreakdown,
  calcBalanceTrend, findBestMonth
} from '../lib/calculations'
import { BalanceAreaChart }      from '../components/charts/AreaChart'
import { IncomeExpenseBarChart } from '../components/charts/BarChart'

// Nombres de meses en español
const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export function ReportsPage() {
  const { transactions, loading } = useTransactions()

  // El selector de período empieza en el mes actual
  const now = new Date()
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1) // 1-12

  // Navegar al mes anterior
  const goPrev = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(y => y - 1)
    } else {
      setSelectedMonth(m => m - 1)
    }
  }

  // Navegar al mes siguiente (no más allá del mes actual)
  const goNext = () => {
    const isCurrentMonth = selectedYear === now.getFullYear() &&
                           selectedMonth === now.getMonth() + 1
    if (isCurrentMonth) return

    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(y => y + 1)
    } else {
      setSelectedMonth(m => m + 1)
    }
  }

  const isCurrentMonth = selectedYear === now.getFullYear() &&
                         selectedMonth === now.getMonth() + 1

  // useMemo — recalcula solo cuando cambian las transacciones o el período seleccionado
  const metrics    = useMemo(() =>
    calcMonthMetrics(transactions, { year: selectedYear, month: selectedMonth }),
    [transactions, selectedYear, selectedMonth]
  )

  const categories = useMemo(() =>
    calcCategoryBreakdown(transactions),
    [transactions]
  )

  const trendData  = useMemo(() => calcBalanceTrend(transactions),  [transactions])
  const chartData  = useMemo(() => trendData.map(d => ({            // reutilizamos para barras
    month: d.month, income: d.income, expenses: d.expenses
  })), [trendData])

  const bestMonth  = useMemo(() => findBestMonth(transactions),     [transactions])

  // Total de gastos del mes seleccionado para calcular porcentajes
  const totalExpenses = categories.reduce((acc, c) => acc + c.value, 0)

  return (
    // id="report-content" para el CSS de impresión
    <div id="report-content" className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Informes</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-0.5">
            Análisis financiero detallado
          </p>
        </div>
        {/* Botón imprimir — oculto en impresión */}
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-txt-secondary)] hover:text-[var(--color-txt-primary)] transition-colors"
        >
          <Printer size={14} /> Exportar PDF
        </button>
      </div>

      {/* Selector de período */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="px-4 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] min-w-[160px] text-center">
          <span className="text-sm font-medium">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </span>
        </div>

        <button
          onClick={goNext}
          disabled={isCurrentMonth}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            'bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]',
            'transition-colors',
            isCurrentMonth
              ? 'text-[var(--color-txt-muted)] opacity-30 cursor-not-allowed'
              : 'text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)]'
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* KPIs del mes seleccionado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos"
          value={formatCurrency(metrics.income)}
          sub="del mes"
          color="green"
          loading={loading}
        />
        <KpiCard
          label="Gastos"
          value={formatCurrency(metrics.expenses)}
          sub="del mes"
          color="red"
          loading={loading}
        />
        <KpiCard
          label="Tasa de ahorro"
          value={`${metrics.savingsRate.toFixed(1)}%`}
          sub={metrics.savingsRate >= 20 ? '✓ Saludable' : 'Meta: 20%'}
          color={metrics.savingsRate >= 20 ? 'green' : 'amber'}
          loading={loading}
        />
        <KpiCard
          label="Gasto prom/día"
          value={formatCurrency(metrics.avgDailyExpense)}
          sub={`${metrics.txCount} transacciones`}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Mejor mes del año */}
      {!loading && bestMonth && bestMonth.savings > 0 && (
        <div className="card flex items-center gap-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-[var(--color-accent-green)]" />
          </div>
          <div>
            <p className="text-sm font-medium">
              🏆 Mejor mes del año: <span className="text-[var(--color-accent-green)]">{bestMonth.label}</span>
            </p>
            <p className="text-xs text-[var(--color-txt-muted)] mt-0.5">
              Ahorraste {formatCurrency(bestMonth.savings)} con una tasa del {bestMonth.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Tendencia del saldo */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4">Tendencia del saldo</h2>
          <div className="h-52">
            {loading
              ? <div className="h-full bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
              : <BalanceAreaChart data={trendData} />
            }
          </div>
        </div>

        {/* Ingresos vs gastos */}
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
      </div>

      {/* Breakdown por categoría */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-4">Gastos por categoría</h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-24 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                <div className="flex-1 h-2 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
                <div className="h-3 w-12 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-[var(--color-txt-muted)] text-center py-8">
            Sin gastos en este período
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map(cat => {
              const pct = totalExpenses > 0
                ? Math.round((cat.value / totalExpenses) * 100)
                : 0

              return (
                <div key={cat.name} className="flex items-center gap-3">
                  {/* Nombre */}
                  <p className="text-xs text-[var(--color-txt-secondary)] w-28 flex-shrink-0">
                    {cat.name}
                  </p>

                  {/* Barra de progreso */}
                  <div className="flex-1 h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>

                  {/* Porcentaje y monto */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-txt-muted)] w-8 text-right">
                      {pct}%
                    </span>
                    <span className="text-xs font-mono font-medium w-20 text-right">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-default)] mt-1">
              <p className="text-xs font-semibold text-[var(--color-txt-secondary)]">Total gastos</p>
              <p className="text-sm font-semibold font-mono text-[var(--color-accent-red)]">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resumen del año */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-4">Resumen anual {selectedYear}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[var(--color-txt-muted)] mb-1">Total ingresos</p>
            <p className="text-lg font-semibold font-mono text-[var(--color-accent-green)]">
              {loading ? '—' : formatCurrency(
                transactions
                  .filter(tx => tx.type === 'income' && tx.date.startsWith(String(selectedYear)))
                  .reduce((a, t) => a + t.amount, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-txt-muted)] mb-1">Total gastos</p>
            <p className="text-lg font-semibold font-mono text-[var(--color-accent-red)]">
              {loading ? '—' : formatCurrency(
                transactions
                  .filter(tx => tx.type === 'expense' && tx.date.startsWith(String(selectedYear)))
                  .reduce((a, t) => a + Math.abs(t.amount), 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-txt-muted)] mb-1">Ahorro neto</p>
            {!loading && (() => {
              const yearIncome   = transactions.filter(tx => tx.type === 'income'  && tx.date.startsWith(String(selectedYear))).reduce((a, t) => a + t.amount, 0)
              const yearExpenses = transactions.filter(tx => tx.type === 'expense' && tx.date.startsWith(String(selectedYear))).reduce((a, t) => a + Math.abs(t.amount), 0)
              const net = yearIncome - yearExpenses
              return (
                <p className={cn(
                  'text-lg font-semibold font-mono flex items-center gap-1',
                  net >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'
                )}>
                  {net >= 0
                    ? <TrendingUp size={16} />
                    : <TrendingDown size={16} />
                  }
                  {formatCurrency(Math.abs(net))}
                </p>
              )
            })()}
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, loading }) {
  const colorMap = {
    green: 'text-[var(--color-accent-green)]',
    red:   'text-[var(--color-accent-red)]',
    blue:  'text-[var(--color-accent-blue)]',
    amber: 'text-[var(--color-accent-amber)]',
  }

  return (
    <div className="card">
      <p className="text-xs text-[var(--color-txt-muted)] uppercase tracking-wide mb-2">
        {label}
      </p>
      {loading ? (
        <>
          <div className="h-6 w-24 bg-[var(--color-bg-elevated)] rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-[var(--color-bg-elevated)] rounded animate-pulse" />
        </>
      ) : (
        <>
          <p className={cn('text-xl font-semibold font-mono mb-0.5', colorMap[color])}>
            {value}
          </p>
          <p className="text-xs text-[var(--color-txt-muted)]">{sub}</p>
        </>
      )}
    </div>
  )
}