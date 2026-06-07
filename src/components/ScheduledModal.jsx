import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import { createScheduledItem } from '../services/scheduled.service'
import { scheduledItemSchema } from '../lib/validations'
import { Modal, Button, Input } from './ui'  

const FREQUENCY_OPTIONS = [
  { value: 'weekly',   label: 'Semanal'   },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly',  label: 'Mensual'   },
  { value: 'yearly',   label: 'Anual'     },
]

const TYPE_OPTIONS = [
  { value: 'expense', label: '💸 Gasto',   activeClass: 'bg-red-500/15 border-red-500/40 text-[var(--color-accent-red)]'          },
  { value: 'saving',  label: '🏦 Ahorro',  activeClass: 'bg-blue-500/15 border-blue-500/40 text-[var(--color-accent-blue)]'        },
  { value: 'income',  label: '💰 Ingreso', activeClass: 'bg-emerald-500/15 border-emerald-500/40 text-[var(--color-accent-green)]' },
]

const CATEGORIES = [
  'Suscripciones', 'Comida', 'Transporte', 'Salud',
  'Educación', 'Servicios', 'Ahorro', 'Salario', 'Otros',
]

export function ScheduledModal({ isOpen, onClose, onCreated }) {
  const user = useAuthStore(state => state.user)

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(scheduledItemSchema),
    defaultValues: {
      name:         '',
      amount:       '',
      type:         'expense',
      frequency:    'monthly',
      day_of_month: '1',
      category:     '',
    }
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const newItem = await createScheduledItem({
        user_id:      user.id,
        name:         data.name,
        amount:       parseFloat(data.amount),
        type:         data.type,
        frequency:    data.frequency,
        day_of_month: parseInt(data.day_of_month),
        category:     data.category,
        active:       true,
      })
      onCreated(newItem)
      onClose()
    } catch (err) {
      console.error('Error creando programado:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo programado">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Tipo */}
        <div>
          <p className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide mb-2">
            Tipo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={[
                  'flex items-center justify-center py-2 rounded-xl border cursor-pointer',
                  'text-xs font-medium transition-all duration-150',
                  selectedType === opt.value
                    ? opt.activeClass
                    : 'border-[var(--color-border-strong)] text-[var(--color-txt-muted)] hover:border-[var(--color-border-default)]'
                ].join(' ')}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="hidden"
                  {...register('type')}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Nombre"
          placeholder="Ej. Netflix, Ahorro vacaciones…"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide">
              Frecuencia
            </label>
            <select className="input-base" {...register('frequency')}>
              {FREQUENCY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Día del mes"
            type="number"
            min="1"
            max="31"
            placeholder="1-31"
            error={errors.day_of_month?.message}
            {...register('day_of_month')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide">
              Categoría
            </label>
            <select className="input-base" {...register('category')}>
              <option value="">Seleccionar…</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-[var(--color-accent-red)]">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}