import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import { createSavingGoal } from '../services/scheduled.service'
import { savingGoalSchema } from '../lib/validations'
import { Modal, Button, Input } from './ui'

const COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4']

export function SavingGoalModal({ isOpen, onClose, onCreated }) {
  const user = useAuthStore(state => state.user)

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(savingGoalSchema),
    defaultValues: {
      name: '', target: '', current: '0',
      deadline: '', color: '#3B82F6',
    }
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const newGoal = await createSavingGoal({
        user_id:  user.id,
        name:     data.name,
        target:   parseFloat(data.target),
        current:  parseFloat(data.current || '0'),
        deadline: data.deadline || null,
        color:    data.color,
      })
      onCreated(newGoal)
      onClose()
    } catch (err) {
      console.error('Error creando meta:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva meta de ahorro">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <Input
          label="Nombre de la meta"
          placeholder="Ej. Viaje a Europa, Fondo emergencia…"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Meta total"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.target?.message}
            {...register('target')}
          />
          <Input
            label="Ya tengo"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.current?.message}
            {...register('current')}
          />
        </div>

        <Input
          label="Fecha límite (opcional)"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        {/* Selector de color */}
        <div>
          <p className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide mb-2">
            Color
          </p>
          <div className="flex gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                style={{ background: color }}
              >
                {selectedColor === color && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Crear meta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}