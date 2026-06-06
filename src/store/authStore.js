import { create } from 'zustand'

// create() recibe una función que devuelve el estado inicial y las acciones
// set() es la función que actualiza el estado — Zustand re-renderiza
// automáticamente los componentes que usan el dato que cambió

export const useAuthStore = create((set) => ({
  // Estado inicial
  user:    null,
  session: null,
  loading: true,   // true al inicio porque no sabemos aún si hay sesión
  profile: null,   // Estado inicial para el perfil

  // Acciones (funciones que modifican el estado)
  setUser:    (user)    => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),


    // Actualiza campos específicos del perfil sin reemplazarlo todo
  updateProfile: (updates) => set(state => ({
    profile: { ...state.profile, ...updates }
  })),

  logout: () => set({ user: null, session: null, profile: null }),
}))