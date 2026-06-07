import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { User, Bell, LogOut, ChevronRight, Check, ShieldCheck, Globe } from 'lucide-react'
import { useAuthStore }  from '../store/authStore'
import { logoutUser, updateProfile, updatePassword, getProfile } from '../services/auth.service'
import { profileSchema, changePasswordSchema } from '../lib/validations'
import { Avatar, Button, Input, Spinner } from '../components/ui'
import { ConfirmModal } from '../components/ConfirmModal'
import { cn } from '../lib/utils'

const CURRENCIES = [
  { value: 'USD', label: 'USD — Dólar americano'   },
  { value: 'EUR', label: 'EUR — Euro'               },
  { value: 'MXN', label: 'MXN — Peso mexicano'     },
  { value: 'COP', label: 'COP — Peso colombiano'   },
  { value: 'ARS', label: 'ARS — Peso argentino'    },
  { value: 'CLP', label: 'CLP — Peso chileno'      },
  { value: 'PEN', label: 'PEN — Sol peruano'       },
]

export function SettingsPage() {
  const navigate  = useNavigate()
  const { user, profile, setProfile, updateProfile: updateProfileStore, logout } = useAuthStore()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutLoading,   setLogoutLoading]   = useState(false)

  // Sección activa: 'profile' | 'security' | 'preferences'
  const [activeSection, setActiveSection] = useState('profile')

  // Preferencias locales (en una app real irían a la DB)
  const [prefs, setPrefs] = useState({
    txNotifications: true,
    weeklyReport:    true,
    goalAlerts:      false,
  })

  // Carga el perfil al montar
  useEffect(() => {
    if (!user) return
    getProfile(user.id)
      .then(data => {
        setProfile(data)
        setLoadingProfile(false)
      })
      .catch(err => {
        console.error('Error cargando perfil:', err)
        setLoadingProfile(false)
      })
  }, [user])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await logoutUser()
      logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
    } finally {
      setLogoutLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-[var(--color-txt-muted)] mt-0.5">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Tarjeta de perfil resumida */}
      <div className="card flex items-center gap-4">
        <Avatar name={profile?.full_name || user?.email} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {profile?.full_name || 'Sin nombre'}
          </p>
          <p className="text-sm text-[var(--color-txt-muted)] truncate mt-0.5">
            {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)]" />
          <span className="text-xs font-medium text-[var(--color-accent-green)]">Activa</span>
        </div>
      </div>

      {/* Tabs de secciones */}
      <div className="flex gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-xl p-1 w-full lg:w-fit">
        {[
          { key: 'profile',     label: 'Perfil',       icon: User       },
          { key: 'security',    label: 'Seguridad',    icon: ShieldCheck },
          { key: 'preferences', label: 'Preferencias', icon: Bell       },
        ].map(({ key, label, icon: Icon }) => (
          <button className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg',
            'text-xs sm:text-sm font-medium transition-all duration-150',
            activeSection === key
              ? 'bg-[var(--color-bg-elevated)] text-[var(--color-txt-primary)]'
              : 'text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)]'
          )}>
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Sección Perfil ── */}
      {activeSection === 'profile' && (
        <ProfileSection
          profile={profile}
          onUpdated={updateProfileStore}
        />
      )}

      {/* ── Sección Seguridad ── */}
      {activeSection === 'security' && (
        <SecuritySection />
      )}

      {/* ── Sección Preferencias ── */}
      {activeSection === 'preferences' && (
        <PreferencesSection prefs={prefs} setPrefs={setPrefs} />
      )}

      {/* Cerrar sesión */}
      <div className="card">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 text-[var(--color-accent-red)] hover:bg-red-500/5 rounded-lg p-2 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={15} />
          </div>
          <span className="text-sm font-medium">Cerrar sesión</span>
          <ChevronRight size={14} className="ml-auto text-[var(--color-txt-muted)]" />
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
        title="Cerrar sesión"
        description="¿Estás seguro que quieres cerrar sesión?"
        variant="logout" 
      />
    </div>
  )
}

// ── Sección: Editar perfil ────────────────────────────────────────────────────

function ProfileSection({ profile, onUpdated }) {
  const user = useAuthStore(state => state.user)
  const [saved, setSaved] = useState(false)

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    resolver: zodResolver(profileSchema),
    // Precarga los valores actuales del perfil
    values: {
      full_name: profile?.full_name || '',
      currency:  profile?.currency  || 'USD',
    }
  })

  const onSubmit = async (data) => {
    try {
      await updateProfile(user.id, data)
      onUpdated(data)  // actualiza el store globalmente
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Error actualizando perfil:', err)
    }
  }

  return (
    <div className="card flex flex-col gap-5">
      <h2 className="text-sm font-semibold">Información personal</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          placeholder="Tu nombre"
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        {/* Email — solo lectura */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide">
            Email
          </label>
          <div className="input-base opacity-50 cursor-not-allowed select-none">
            {user?.email}
          </div>
          <p className="text-xs text-[var(--color-txt-muted)]">
            El email no se puede cambiar desde aquí
          </p>
        </div>

        {/* Moneda */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide flex items-center gap-1.5">
            <Globe size={12} /> Moneda principal
          </label>
          <select className="input-base" {...register('currency')}>
            {CURRENCIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-fit"
        >
          {saved ? (
            // Feedback visual de guardado exitoso
            <span className="flex items-center gap-2">
              <Check size={14} /> Guardado
            </span>
          ) : isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  )
}

// ── Sección: Cambiar contraseña ───────────────────────────────────────────────

function SecuritySection() {
  const [saved,        setSaved]        = useState(false)
  const [apiError,     setApiError]     = useState('')
  const [showNew,      setShowNew]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  })

  const onSubmit = async (data) => {
    try {
      setApiError('')
      await updatePassword(data.newPassword)
      setSaved(true)
      reset()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setApiError('Error al cambiar la contraseña. Intenta de nuevo.')
      console.error(err)
    }
  }

  return (
    <div className="card flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold">Cambiar contraseña</h2>
        <p className="text-xs text-[var(--color-txt-muted)] mt-1">
          Usa una contraseña segura con mayúsculas y números
        </p>
      </div>

      {saved && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-[var(--color-accent-green)] flex items-center gap-2">
            <Check size={14} /> Contraseña actualizada correctamente
          </p>
        </div>
      )}

      {apiError && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-[var(--color-accent-red)]">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nueva contraseña"
          type={showNew ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          hint="Debe tener una mayúscula y un número"
          error={errors.newPassword?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowNew(p => !p)}
              className="text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)] transition-colors text-xs"
            >
              {showNew ? 'Ocultar' : 'Ver'}
            </button>
          }
          {...register('newPassword')}
        />

        <Input
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repite la nueva contraseña"
          error={errors.confirmPassword?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm(p => !p)}
              className="text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)] transition-colors text-xs"
            >
              {showConfirm ? 'Ocultar' : 'Ver'}
            </button>
          }
          {...register('confirmPassword')}
        />

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? 'Actualizando…' : 'Actualizar contraseña'}
        </Button>
      </form>
    </div>
  )
}

// ── Sección: Preferencias ─────────────────────────────────────────────────────

function PreferencesSection({ prefs, setPrefs }) {
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const items = [
    {
      key:   'txNotifications',
      icon:  Bell,
      name:  'Alertas de transacción',
      desc:  'Notificar cada nuevo movimiento',
    },
    {
      key:   'weeklyReport',
      icon:  ChevronRight,
      name:  'Resumen semanal',
      desc:  'Recibir informe cada lunes',
    },
    {
      key:   'goalAlerts',
      icon:  ChevronRight,
      name:  'Alertas de metas',
      desc:  'Notificar progreso de ahorro',
    },
  ]

  return (
    <div className="card flex flex-col gap-1">
      <h2 className="text-sm font-semibold mb-3">Notificaciones</h2>
      {items.map(({ key, icon: Icon, name, desc }) => (
        <div
          key={key}
          className="flex items-center gap-3 py-3 border-b border-[var(--color-border-default)] last:border-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <Icon size={15} className="text-[var(--color-txt-muted)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-[var(--color-txt-muted)] mt-0.5">{desc}</p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => toggle(key)}
            className={cn(
              'w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0',
              prefs[key]
                ? 'bg-[var(--color-accent-blue)]'
                : 'bg-[var(--color-bg-elevated)]'
            )}
          >
            <span className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
              prefs[key] ? 'translate-x-5' : 'translate-x-1'
            )} />
          </button>
        </div>
      ))}
    </div>
  )
}