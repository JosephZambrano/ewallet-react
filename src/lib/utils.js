// Formatea un número como moneda
// Ej: formatCurrency(1234.5) → "$1,234.50"
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Une clases CSS condicionalmente (como el popular clsx)
// Ej: cn('base-class', isActive && 'active-class') 
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Obtiene las iniciales de un nombre
// Ej: getInitials("Ana Cortés") → "AC"
export function getInitials(name = '') {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}