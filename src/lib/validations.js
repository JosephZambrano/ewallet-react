import { z } from 'zod'

// z.object() define la forma del objeto que esperamos
// Cada campo tiene su tipo y sus reglas de validación
// Los mensajes de error los definimos nosotros en español

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),

  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres'),
})

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),

  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),

  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),

  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
})
// .refine() agrega validaciones que cruzan múltiples campos
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'], // en qué campo mostrar el error
  }
)

export const resetSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
})

// Schema de validación para transacción

export const transactionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(60, 'Máximo 60 caracteres'),

  amount: z
    .string()
    .min(1, 'El monto es requerido')
    // coerce intenta convertir el string a número
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Ingresa un monto válido mayor a 0'
    }),

  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Selecciona el tipo' })
  }),

  category: z.string().min(1, 'Selecciona una categoría'),

  date: z.string().min(1, 'La fecha es requerida'),

  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

// Schema para editar perfil (solo nombre completo por ahora)
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
})

export const scheduledItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(60, 'Máximo 60 caracteres'),
  amount: z.string().min(1, 'El monto es requerido')
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Ingresa un monto válido mayor a 0'
    }),
  type: z.enum(['expense', 'saving', 'income']),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  day_of_month: z.string()
    .refine(v => { const n = parseInt(v); return !isNaN(n) && n >= 1 && n <= 31 }, {
      message: 'Día entre 1 y 31'
    }),
  category: z.string().min(1, 'Selecciona una categoría'),
})

// Para actualizar perfil, solo permitimos cambiar el nombre completo
export const savingGoalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(60, 'Máximo 60 caracteres'),
  target: z.string().min(1, 'La meta es requerida')
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Ingresa un monto válido mayor a 0'
    }),
  current: z.string()
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: 'Ingresa un monto válido'
    })
    .optional()
    .default('0'),
  deadline: z.string().optional(),
  color: z.string().default('#3B82F6'),
})

// Opciones de categorías para cada tipo de transacción
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  currency: z.enum(['USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN']),
})

// Para cambiar contraseña, solo necesitamos la nueva y su confirmación
export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine(
  data => data.newPassword === data.confirmPassword,
  { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] }
)