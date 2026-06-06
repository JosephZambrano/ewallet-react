import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import { createTransaction } from '../services/transactions.service'
import { transactionSchema } from '../lib/validations'
import { Modal, Button, Input } from './ui'

const CATEGORIES = {
  expense: ['Supermercado','Comida','Transporte','Salud','Suscripciones','Entretenimiento','Servicios','Educación','Otros'],
  income:  ['Salario','Freelance','Inversiones','Regalo','Otros'],
}

// Recibe 'transaction' cuando es modo edición, undefined cuando es creación
export function TransactionModal({ isOpen, onClose, onCreated, onUpdated, transaction }) {
  const user = useAuthStore(state => state.user)

  // ¿Estamos editando o creando?
  const isEditing = !!transaction

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(transactionSchema),
    // Si hay transacción, precargamos sus valores en el formulario
    defaultValues: {
      name:     '',
      amount:   '',
      type:     'expense',
      category: '',
      date:     format(new Date(), 'yyyy-MM-dd'),
      notes:    '',
    }
  })

  // Cuando se abre en modo edición, rellenamos el form con los datos existentes
  // useEffect con [transaction, isOpen] para que corra cada vez que cambia la tx
  useEffect(() => {
    if (isOpen && transaction) {
      reset({
        name:     transaction.name,
        // amount siempre positivo en el form — el signo lo manejamos al guardar
        amount:   String(Math.abs(transaction.amount)),
        type:     transaction.type,
        category: transaction.category,
        date:     transaction.date,
        notes:    transaction.notes || '',
      })
    } else if (isOpen && !transaction) {
      // Modo creación: limpiar el form
      reset({
        name:     '',
        amount:   '',
        type:     'expense',
        category: '',
        date:     format(new Date(), 'yyyy-MM-dd'),
        notes:    '',
      })
    }
  }, [isOpen, transaction, reset])

  const selectedType = watch('type')

  const onSubmit = async (data) => {
    try {
      const amount = data.type === 'expense'
        ? -Math.abs(parseFloat(data.amount))
        :  Math.abs(parseFloat(data.amount))

      if (isEditing) {
        // ── Modo edición: UPDATE ──────────────────────────────
        const updated = await updateTransaction(transaction.id, {
          name:     data.name,
          amount,
          type:     data.type,
          category: data.category,
          date:     data.date,
          notes:    data.notes || null,
        })
        onUpdated?.(updated)  // ?. evita error si no se pasó el callback
      } else {
        // ── Modo creación: INSERT ─────────────────────────────
        const newTx = await createTransaction({
          user_id:  user.id,
          name:     data.name,
          amount,
          type:     data.type,
          category: data.category,
          date:     data.date,
          notes:    data.notes || null,
        })
        onCreated?.(newTx)
      }

      onClose()
    } catch (err) {
      console.error('Error guardando transacción:', err)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // Título dinámico según el modo
      title={isEditing ? 'Editar transacción' : 'Nueva transacción'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Selector de tipo */}
        <div>
          <p className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide mb-2">
            Tipo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'expense', label: '💸 Gasto',  activeClass: 'bg-red-500/15 border-red-500/40 text-[var(--color-accent-red)]'         },
              { value: 'income',  label: '💰 Ingreso', activeClass: 'bg-emerald-500/15 border-emerald-500/40 text-[var(--color-accent-green)]' },
            ].map(opt => (
              <label key={opt.value} className={[
                'flex items-center justify-center py-2.5 rounded-xl border cursor-pointer',
                'text-sm font-medium transition-all duration-150',
                selectedType === opt.value
                  ? opt.activeClass
                  : 'border-[var(--color-border-strong)] text-[var(--color-txt-muted)] hover:border-[var(--color-border-default)]'
              ].join(' ')}>
                <input type="radio" value={opt.value} className="hidden" {...register('type')} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Nombre"
          placeholder="Ej. Supermercado, Salario julio…"
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
          <Input
            label="Fecha"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        {/* Categorías */}
        <div>
          <p className="text-xs font-medium text-[var(--color-txt-secondary)] uppercase tracking-wide mb-2">
            Categoría
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES[selectedType]?.map(cat => (
              <label key={cat} className="cursor-pointer">
                <input type="radio" value={cat} className="hidden" {...register('category')} />
                <CategoryChip cat={cat} selected={watch('category') === cat} />
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="text-xs text-[var(--color-accent-red)] mt-1.5">
              {errors.category.message}
            </p>
          )}
        </div>

        <Input
          label="Notas (opcional)"
          placeholder="Detalles adicionales…"
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {/* Texto dinámico según modo y estado */}
            {isSubmitting
              ? (isEditing ? 'Guardando…' : 'Creando…')
              : (isEditing ? 'Guardar cambios' : 'Guardar')
            }
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function CategoryChip({ cat, selected }) {
  return (
    <span className={[
      'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
      selected
        ? 'bg-blue-500/15 border-blue-500/40 text-[var(--color-accent-blue)]'
        : 'border-[var(--color-border-strong)] text-[var(--color-txt-muted)] hover:border-[var(--color-border-default)]'
    ].join(' ')}>
      {cat}
    </span>
  )
}