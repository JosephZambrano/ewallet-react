import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, CalendarClock,
  PieChart, Settings, ShieldCheck
} from 'lucide-react'
import { Avatar } from '../ui'
import { useAuthStore } from '../../store/authStore'

// Definimos la navegación como datos, no como JSX repetido
// Si mañana quieres agregar una sección, solo agregas un objeto aquí
const navItems = [
  { label: 'Dashboard',    path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Movimientos',  path: '/movements',  icon: ArrowLeftRight },
  { label: 'Programar',    path: '/schedule',   icon: CalendarClock },
  { label: 'Informes',     path: '/reports',    icon: PieChart },
  { label: 'Configuración',path: '/settings',   icon: Settings },
]

export function Sidebar() {
  // Leemos el usuario del store global (lo crearemos en el siguiente paso)
  const user = useAuthStore(state => state.user)

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-default)] flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[var(--color-border-default)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-blue)] flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} color="white" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">eWallet</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ label, path, icon: Icon }) => (
          // NavLink de React Router añade automáticamente la clase 'active'
          // cuando la ruta coincide con el path actual
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              // Función que recibe un objeto con isActive (boolean)
              // y devuelve las clases CSS según el estado
              [
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-blue-500/10 text-[var(--color-accent-blue)] font-medium'
                  : 'text-[var(--color-txt-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-txt-primary)]'
              ].join(' ')
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Usuario en el fondo */}
      <div className="px-3 py-4 border-t border-[var(--color-border-default)]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-colors">
          <Avatar name={user?.full_name || 'Usuario'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--color-txt-primary)] truncate">
              {user?.full_name || 'Mi cuenta'}
            </p>
            <p className="text-[11px] text-[var(--color-txt-muted)] truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}