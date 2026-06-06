import { supabase } from '../lib/supabase'

// Trae TODAS las transacciones del usuario autenticado
// Supabase RLS filtra automáticamente por user_id gracias a la política que creamos
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })  // más recientes primero

  if (error) throw error
  return data
}

// Trae transacciones de un rango de fechas específico
export async function getTransactionsByDateRange(from, to) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', from)   // gte = greater than or equal (>=)
    .lte('date', to)     // lte = less than or equal (<=)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

// Insertar nueva transacción
export async function createTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()  // devuelve el registro insertado con su id generado
    .single()  // esperamos un solo objeto, no un array

  if (error) throw error
  return data
}

// Eliminar transacción por id
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)  // eq = equal (=)

  if (error) throw error
}

// Actualizar transacción por id
export async function updateTransaction(id, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}