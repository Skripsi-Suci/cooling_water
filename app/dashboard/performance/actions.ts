'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function runModelTest() {
  const supabase = await createClient()
  
  // Ambil ID user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Simulasi pengujian model (dalam implementasi nyata, ini akan memanggil skrip python/model)
  // Menghasilkan angka acak di sekitar 95-98% untuk simulasi performa yang baik
  const accuracy = 0.95 + (Math.random() * 0.03)
  const precision = 0.94 + (Math.random() * 0.04)
  const recall = 0.95 + (Math.random() * 0.03)
  const f1_score = 0.95 + (Math.random() * 0.03)

  const { error } = await supabase
    .from('model_performance')
    .insert({
      accuracy,
      precision,
      recall,
      f1_score,
      tested_by: user.id
    })

  if (error) {
    console.error('Error saving test results:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/performance')
  return { success: true }
}

export async function deletePerformanceResult(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('model_performance')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting result:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/performance')
  return { success: true }
}
