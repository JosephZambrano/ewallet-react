import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, session, loading, setUser, setSession, setLoading, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Al montar, intentamos recuperar la sesión guardada en localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Suscripción a cambios de auth
    // Esto se ejecuta cuando el usuario hace login, logout,
    // o cuando el token expira y se renueva automáticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // 3. Limpieza: cancelamos la suscripción cuando el componente se desmonta
    // Sin esto tendríamos memory leaks (funciones corriendo en componentes ya destruidos)
    return () => subscription.unsubscribe()
  }, []) // [] = solo corre una vez al montar

  return { user, session, loading }
}