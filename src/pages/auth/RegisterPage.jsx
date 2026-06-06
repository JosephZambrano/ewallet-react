import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { registerSchema } from '../../lib/validations'
import { registerUser } from '../../services/auth.service'
import { Button, Input } from '../../components/ui'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [authError, setAuthError]       = useState('')
  const [success, setSuccess]           = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' }
  })

  const onSubmit = async (data) => {
    try {
      setAuthError('')
      await registerUser(data)
      // Supabase por defecto requiere verificar el email antes de poder ingresar
      // Mostramos un mensaje en lugar de redirigir directo
      setSuccess(true)
    } catch (error) {
      if (error.message.includes('already registered')) {
        setAuthError('Este email ya tiene una cuenta registrada')
      } else {
        setAuthError('Error al crear la cuenta. Intenta de nuevo.')
      }
    }
  }

  // Pantalla de éxito — email enviado
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-[var(--color-accent-green)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Revisa tu email</h2>
          <p className="text-sm text-[var(--color-txt-muted)] mb-6">
            Te enviamos un link de confirmación. Una vez que confirmes tu cuenta podrás ingresar.
          </p>
          <Button variant="ghost" onClick={() => navigate('/login')} className="w-full">
            Ir al login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-blue)] flex items-center justify-center mb-4">
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-1">
            Empieza a controlar tus finanzas
          </p>
        </div>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-6">

          {authError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-[var(--color-accent-red)]">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <Input
              label="Nombre completo"
              type="text"
              placeholder="Ana Cortés"
              leftIcon={<User size={15} />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="ana@ejemplo.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              leftIcon={<Lock size={15} />}
              hint="Debe tener una mayúscula y un número"
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)] transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('password')}
            />

            <Input
              label="Confirmar contraseña"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              leftIcon={<Lock size={15} />}
              error={errors.confirmPassword?.message}
              rightIcon={
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)] transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('confirmPassword')}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-txt-muted)] mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[var(--color-accent-blue)] hover:underline font-medium">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  )
}