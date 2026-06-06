import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../lib/utils'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, color } = payload[0].payload

  return (
    <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] rounded-xl p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
        <span className="text-[var(--color-txt-secondary)]">{name}:</span>
        <span className="font-medium text-[var(--color-txt-primary)]">{formatCurrency(value)}</span>
      </div>
    </div>
  )
}

export function ExpenseDonutChart({ data }) {
  // Si no hay datos, mostramos un placeholder
  if (!data?.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs text-[var(--color-txt-muted)]">Sin gastos este mes</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"   // el hueco del centro — hace el donut
          outerRadius="85%"
          paddingAngle={2}    // espacio entre segmentos
          dataKey="value"
        >
          {data.map((entry, index) => (
            // Cell aplica el color a cada segmento individualmente
            <Cell key={index} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}