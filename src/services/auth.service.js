import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw error

  // Actualizar store con los datos de la sesión
  const { setUser, setSession } = useAuthStore.getState()
  setUser(data.user)
  setSession(data.session)

  return data
}

export async function registerUser({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  if (error) throw error

  return data
}

export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  if (error) throw error

  return data
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) throw error

  return data
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error

  const { logout } = useAuthStore.getState()
  logout()
}

// Actualiza datos del perfil en la tabla profiles
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Cambia la contraseña del usuario autenticado
// Supabase requiere que el usuario esté logueado para esto
export async function updatePassword_Profile(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) throw error
}

// Obtiene el perfil completo desde la tabla profiles
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
