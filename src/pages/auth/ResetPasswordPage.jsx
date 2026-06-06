import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import { resetSchema } from '../../lib/validations'
import { resetPassword } from '../../services/auth.service'
import { Button, Input } from '../../components/ui'

export function ResetPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema)
  })

  const onSubmit = async ({ email }) => {
    await resetPassword(email)
    setSent(true)  // Mostramos éxito sin importar si el email existe (seguridad)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-[var(--color-accent-blue)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Email enviado</h2>
          <p className="text-sm text-[var(--color-txt-muted)] mb-6">
            Si ese email tiene una cuenta, recibirás las instrucciones para restablecer tu contraseña.
          </p>
          <Link to="/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft size={15} /> Volver al login
            </Button>
          </Link>
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
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
          <p className="text-sm text-[var(--color-txt-muted)] mt-1 text-center">
            Te enviamos un link para restablecerla
          </p>
        </div>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="ana@ejemplo.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-txt-muted)] mt-6">
          <Link to="/login" className="text-[var(--color-accent-blue)] hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={13} /> Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}