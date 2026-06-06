import { supabase } from '../lib/supabase'

export async function getScheduledItems() {
  const { data, error } = await supabase
    .from('scheduled_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createScheduledItem(item) {
  const { data, error } = await supabase
    .from('scheduled_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleScheduledItem(id, active) {
  const { data, error } = await supabase
    .from('scheduled_items')
    .update({ active })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteScheduledItem(id) {
  const { error } = await supabase
    .from('scheduled_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getSavingGoals() {
  const { data, error } = await supabase
    .from('saving_goals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSavingGoal(goal) {
  const { data, error } = await supabase
    .from('saving_goals')
    .insert(goal)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGoalProgress(id, current) {
  const { data, error } = await supabase
    .from('saving_goals')
    .update({ current })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSavingGoal(id) {
  const { error } = await supabase
    .from('saving_goals')
    .delete()
    .eq('id', id)
  if (error) throw error
}