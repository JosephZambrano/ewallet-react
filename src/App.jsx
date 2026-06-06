import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }           from './hooks/useAuth'
import { AppLayout }         from './components/layout/AppLayout'
import { ProtectedRoute }    from './components/layout/ProtectedRoute'
import { LoginPage }         from './pages/auth/LoginPage'
import { RegisterPage }      from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { DashboardPage }     from './pages/DashboardPage'
import { MovementsPage }     from './pages/MovementsPage'
import { SchedulePage }      from './pages/SchedulePage'
import { ReportsPage }       from './pages/ReportsPage'
import { Spinner }           from './components/ui'
import { SettingsPage }      from './pages/SettingsPage'


function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/movements" element={<MovementsPage />} />
        <Route path="/schedule"  element={<SchedulePage />} />
        <Route path="/reports"   element={<ReportsPage />} />
        <Route path="/settings"  element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}