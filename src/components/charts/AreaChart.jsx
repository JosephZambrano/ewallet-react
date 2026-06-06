import {
  AreaChart as ReAreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '../../lib/utils'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] rounded-xl p-3 text-xs">
      <p className="text-[var(--color-txt-muted)] mb-2 font-medium">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-sm" style={{ background: entry.stroke }} />
          <span className="text-[var(--color-txt-secondary)]">
            {entry.name === 'balance' ? 'Saldo' : entry.name}:
          </span>
          <span className="font-medium text-[var(--color-txt-primary)]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function BalanceAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReAreaChart data={data}>
        <defs>
          {/* Gradiente para el relleno del área */}
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />

        <XAxis
          dataKey="month"
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          width={40}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="balance"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#balanceGradient)"  // usa el gradiente definido arriba
          dot={false}                    // sin puntos en cada dato
          activeDot={{ r: 4, fill: '#3B82F6' }}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  )
}