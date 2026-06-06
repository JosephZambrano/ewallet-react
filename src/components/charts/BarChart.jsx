import {
  BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '../../lib/utils'

// Tooltip personalizado — el que aparece al hacer hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] rounded-xl p-3 text-xs">
      <p className="text-[var(--color-txt-muted)] mb-2 font-medium">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-sm" style={{ background: entry.fill }} />
          <span className="text-[var(--color-txt-secondary)]">
            {entry.name === 'income' ? 'Ingresos' : 'Gastos'}:
          </span>
          <span className="font-medium text-[var(--color-txt-primary)]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function IncomeExpenseBarChart({ data }) {
  return (
    // ResponsiveContainer hace que el gráfico ocupe el 100% del contenedor padre
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} barGap={4} barCategoryGap="30%">

        {/* Líneas de fondo horizontales */}
        <CartesianGrid
          vertical={false}
          stroke="rgba(255,255,255,0.04)"
        />

        {/* Eje X — los meses */}
        <XAxis
          dataKey="month"
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        {/* Eje Y — los montos */}
        <YAxis
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          width={36}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

        <Bar dataKey="income"   fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}