import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

// Outlet es el "hueco" donde React Router renderiza
// la página activa según la ruta. El Sidebar siempre
// está visible; solo el contenido central cambia.

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] overflow-hidden">
      <Sidebar />

      {/* Área de contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}