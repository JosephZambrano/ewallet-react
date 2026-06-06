import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../ui'

// Este componente "envuelve" las rutas privadas
// Si no hay sesión → redirige a /login
// Si está cargando → muestra spinner (evita el flash de redirección)
// Si hay sesión → muestra el contenido normal

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  // Mientras verificamos si hay sesión guardada, mostramos un loader
  // Sin esto, la app redirige a /login por un instante aunque estés logueado
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <Spinner size="lg" />
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir al login
  // 'replace' evita que /dashboard quede en el historial del navegador
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}