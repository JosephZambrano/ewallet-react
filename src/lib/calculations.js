import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

// Calcula el saldo total (suma de todos los ingresos menos todos los gastos)
// reduce() recorre el array acumulando un valor
// acc = acumulador (empieza en 0), tx = transacción actual
export function calcBalance(transactions) {
  return transactions.reduce((acc, tx) => acc + tx.amount, 0)
}

// Filtra transacciones del mes actual y suma los ingresos
export function calcMonthlyIncome(transactions) {
  const now = new Date()
  const from = format(startOfMonth(now), 'yyyy-MM-dd')
  const to   = format(endOfMonth(now),   'yyyy-MM-dd')

  return transactions
    .filter(tx => tx.type === 'income' && tx.date >= from && tx.date <= to)
    .reduce((acc, tx) => acc + tx.amount, 0)
}

// Igual pero para gastos (amount es negativo, Math.abs lo vuelve positivo)
export function calcMonthlyExpenses(transactions) {
  const now = new Date()
  const from = format(startOfMonth(now), 'yyyy-MM-dd')
  const to   = format(endOfMonth(now),   'yyyy-MM-dd')

  return transactions
    .filter(tx => tx.type === 'expense' && tx.date >= from && tx.date <= to)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0)
}

// Agrupa gastos por categoría para el gráfico de dona
// Devuelve: [{ name: 'Comida', value: 178, color: '#3B82F6' }, ...]
export function calcCategoryBreakdown(transactions) {
  const colors = {
    'Comida':          '#3B82F6',
    'Transporte':      '#10B981',
    'Entretenimiento': '#F59E0B',
    'Salud':           '#8B5CF6',
    'Suscripciones':   '#EF4444',
    'Servicios':       '#06B6D4',
    'Freelance':       '#10B981',
    'Salario':         '#3B82F6',
  }

  // Filtramos solo gastos del mes actual
  const now  = new Date()
  const from = format(startOfMonth(now), 'yyyy-MM-dd')
  const to   = format(endOfMonth(now),   'yyyy-MM-dd')

  const expenses = transactions.filter(
    tx => tx.type === 'expense' && tx.date >= from && tx.date <= to
  )

  // Reducimos a un objeto { Comida: 178, Transporte: 60, ... }
  const grouped = expenses.reduce((acc, tx) => {
    const cat = tx.category
    acc[cat] = (acc[cat] || 0) + Math.abs(tx.amount)
    return acc
  }, {})

  // Convertimos el objeto a array para Recharts
  return Object.entries(grouped)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,  // redondear a 2 decimales
      color: colors[name] || '#475569',
    }))
    .sort((a, b) => b.value - a.value)  // ordenar de mayor a menor
}

// Genera datos de los últimos N meses para el gráfico de barras
// Devuelve: [{ month: 'Ene', income: 3800, expenses: 2100 }, ...]
export function calcMonthlyChart(transactions, months = 6) {
  return Array.from({ length: months }, (_, i) => {
    // subMonths(now, i) = hace i meses atrás
    const date  = subMonths(new Date(), months - 1 - i)
    const from  = format(startOfMonth(date), 'yyyy-MM-dd')
    const to    = format(endOfMonth(date),   'yyyy-MM-dd')
    const label = format(date, 'MMM', { locale: es })
      // Capitalizar primera letra: "ene" → "Ene"
      .replace(/^\w/, c => c.toUpperCase())

    const monthTxs = transactions.filter(tx => tx.date >= from && tx.date <= to)

    const income = monthTxs
      .filter(tx => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const expenses = monthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0)

    return {
      month:    label,
      income:   Math.round(income),
      expenses: Math.round(expenses),
    }
  })
}

// Calcula métricas para un mes específico
// Recibe transactions y un objeto { year, month } (month es 1-12)
export function calcMonthMetrics(transactions, { year, month }) {
  const pad    = String(month).padStart(2, '0')  // 6 → '06'
  const prefix = `${year}-${pad}`                // '2026-06'

  const monthTxs = transactions.filter(tx => tx.date.startsWith(prefix))

  const income = monthTxs
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const expenses = monthTxs
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0)

  const savings    = income - expenses
  // Tasa de ahorro: qué % de los ingresos se ahorra
  // Si no hay ingresos, es 0 para evitar división por cero
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  // Días únicos con gastos en el mes
  const daysWithExpenses = new Set(
    monthTxs.filter(tx => tx.type === 'expense').map(tx => tx.date)
  ).size

  const avgDailyExpense = daysWithExpenses > 0
    ? expenses / daysWithExpenses
    : 0

  return {
    income,
    expenses,
    savings,
    savingsRate,
    avgDailyExpense,
    txCount: monthTxs.length,
  }
}

// Genera datos para el gráfico de área (saldo acumulado mes a mes)
export function calcBalanceTrend(transactions, months = 12) {
  // Ordenamos todas las transacciones de más antigua a más nueva
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  let runningBalance = 0

  return Array.from({ length: months }, (_, i) => {
    const date  = subMonths(new Date(), months - 1 - i)
    const from  = format(startOfMonth(date), 'yyyy-MM-dd')
    const to    = format(endOfMonth(date),   'yyyy-MM-dd')
    const label = format(date, 'MMM', { locale: es })
      .replace(/^\w/, c => c.toUpperCase())

    // Suma todas las transacciones de este mes al balance corriente
    const monthNet = sorted
      .filter(tx => tx.date >= from && tx.date <= to)
      .reduce((acc, tx) => acc + tx.amount, 0)

    runningBalance += monthNet

    return {
      month:   label,
      balance: Math.round(runningBalance),
      income:  Math.round(sorted.filter(tx => tx.date >= from && tx.date <= to && tx.type === 'income').reduce((a, t) => a + t.amount, 0)),
      expenses: Math.round(sorted.filter(tx => tx.date >= from && tx.date <= to && tx.type === 'expense').reduce((a, t) => a + Math.abs(t.amount), 0)),
    }
  })
}

// Encuentra el mejor mes (mayor ahorro neto) del año
export function findBestMonth(transactions) {
  const now = new Date()

  const months = Array.from({ length: 12 }, (_, i) => {
    const date    = subMonths(now, 11 - i)
    const metrics = calcMonthMetrics(transactions, {
      year:  date.getFullYear(),
      month: date.getMonth() + 1,
    })
    return {
      label: format(date, 'MMMM', { locale: es }).replace(/^\w/, c => c.toUpperCase()),
      ...metrics,
    }
  })

  // El mes con mayor ahorro neto
  return months.reduce((best, m) => m.savings > best.savings ? m : best, months[0])
}