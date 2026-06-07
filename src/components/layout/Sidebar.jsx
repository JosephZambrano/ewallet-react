import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, CalendarClock,
  PieChart, Settings, ShieldCheck
} from 'lucide-react'
import { Avatar } from '../ui'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { label: 'Dashboard',    path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Movimientos',  path: '/movements',  icon: ArrowLeftRight  },
  { label: 'Programar',    path: '/schedule',   icon: CalendarClock   },
  { label: 'Informes',     path: '/reports',    icon: PieChart        },
  { label: 'Config',       path: '/settings',   icon: Settings        },
]

// ── Desktop/Tablet Sidebar ────────────────────────────────────────────────────
export function Sidebar() {
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)

  return (
    <aside className="
      hidden md:flex
      w-16 lg:w-[220px]
      flex-shrink-0
      bg-[var(--color-bg-secondary)]
      border-r border-[var(--color-border-default)]
      flex-col h-screen sticky top-0
      transition-all duration-300
    ">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 lg:px-5 py-6 border-b border-[var(--color-border-default)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-blue)] flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} color="white" />
        </div>
        {/* Solo visible en desktop */}
        <span className="hidden lg:block text-[15px] font-semibold tracking-tight">
          eWallet
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            className={({ isActive }) => [
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150',
              'justify-center lg:justify-start',
              isActive
                ? 'bg-blue-500/10 text-[var(--color-accent-blue)]'
                : 'text-[var(--color-txt-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-txt-primary)]'
            ].join(' ')}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden lg:block text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div className="px-2 lg:px-3 py-4 border-t border-[var(--color-border-default)]">
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-colors justify-center lg:justify-start"
        >
          <Avatar name={profile?.full_name || user?.email || 'U'} size="sm" />
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--color-txt-primary)] truncate">
              {profile?.full_name || 'Mi cuenta'}
            </p>
            <p className="text-[11px] text-[var(--color-txt-muted)] truncate">
              {user?.email}
            </p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}

// ── Mobile Bottom Navigation ──────────────────────────────────────────────────
export function BottomNav() {
  return (
    <nav className="
      md:hidden fixed bottom-0 left-0 right-0 z-40
      bg-[var(--color-bg-secondary)]
      border-t border-[var(--color-border-default)]
      flex items-center justify-around
      px-2 py-2
      safe-area-bottom
    ">
      {navItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => [
            'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-0',
            isActive
              ? 'text-[var(--color-accent-blue)]'
              : 'text-[var(--color-txt-muted)]'
          ].join(' ')}
        >
          {({ isActive }) => (
            <>
              <div className={[
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                isActive ? 'bg-blue-500/15' : ''
              ].join(' ')}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-medium truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}