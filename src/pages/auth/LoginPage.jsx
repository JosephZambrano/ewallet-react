import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { loginSchema } from '../../lib/validations'
import { loginUser } from '../../services/auth.service'
import { Button, Input } from '../../components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')   // errores de la API

  // useForm inicializa el formulario
  // zodResolver conecta nuestro schema de Zod con React Hook Form
  const {
    register,      // función para "registrar" cada input en el form
    handleSubmit,  // wrapper que valida antes de llamar a nuestra función
    formState: { errors, isSubmitting }  // estado del form
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  // Esta función solo se llama si la validación de Zod pasa
  const onSubmit = async (data) => {
    try {
      setAuthError('')  // limpiamos errores previos
      await loginUser(data)
      // Si loginUser no lanzó error, la sesión ya está guardada
      // onAuthStateChange en useAuth detectará el cambio automáticamente
      navigate('/dashboard')
    } catch (error) {
      // Supabase devuelve errores en inglés, los traducimos
      if (error.message.includes('Invalid login credentials')) {
        setAuthError('Email o contraseña incorrectos')
      } else if (error.message.includes('Email not confirmed')) {
        setAuthError('Confirma tu email antes de ingresar')
      } else {
        setAuthError('Ocurrió un error. Intenta de nuevo.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-blue)] flex items-center justify-center mb-4">
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-1">
            Ingresa a tu cuenta
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-6">

          {/* Error general de la API */}
          {authError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-[var(--color-accent-red)]">{authError}</p>
            </div>
          )}

          {/* handleSubmit(onSubmit) valida y luego llama onSubmit */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <Input
              label="Email"
              type="email"
              placeholder="ana@ejemplo.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              // register conecta este input con React Hook Form
              // spread porque register devuelve un objeto con name, ref, onChange, onBlur
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-[var(--color-txt-muted)] hover:text-[var(--color-txt-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('password')}
            />

            {/* Link de recuperar contraseña */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/reset-password"
                className="text-xs text-[var(--color-txt-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>

        {/* Link a registro */}
        <p className="text-center text-sm text-[var(--color-txt-muted)] mt-6">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-[var(--color-accent-blue)] hover:underline font-medium"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}