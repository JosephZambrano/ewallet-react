import { Outlet } from 'react-router-dom'
import { Sidebar, BottomNav } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] overflow-hidden">

      {/* Sidebar — visible en md+ */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="
        flex-1 overflow-y-auto
        pb-20 md:pb-0
      ">
        {/* pb-20 en mobile deja espacio para el bottom nav */}
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — visible solo en mobile */}
      <BottomNav />
    </div>
  )
}