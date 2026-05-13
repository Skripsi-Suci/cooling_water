'use server'

import { createClient } from '@/lib/supabase/server'
import { classificationSchema, type ClassificationInput } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function processClassification(data: ClassificationInput) {
  const supabase = await createClient()
  
  // Validate data
  const validated = classificationSchema.parse(data)

  // MOCK Random Forest Logic
  // In a real scenario, this would call a Python API or a JS ML library
  let result: 'layak' | 'tidak_layak' = 'layak'
  let analysisNotes = "Semua parameter berada dalam batas normal."

  const deviations = []
  if (validated.ph < 6.5 || validated.ph > 8.5) deviations.push("pH")
  if (validated.iron > 0.3) deviations.push("Fe (Besi)")
  if (validated.turbidity > 5) deviations.push("Turbidity")
  if (validated.nitrite < 500) deviations.push("Nitrite (Terlalu rendah)")

  if (deviations.length > 0) {
    result = 'tidak_layak'
    analysisNotes = `Parameter ${deviations.join(', ')} menyimpang dari standar operasional.`
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Save to database
  const { error } = await supabase.from('classifications').insert({
    operator_id: user.id,
    date: new Date().toISOString(),
    unit_name: validated.unit_name,
    engine_id: validated.engine_id,
    running_hour: validated.running_hour,
    ph: validated.ph,
    sc: validated.sc,
    nitrite: validated.nitrite,
    iron: validated.iron,
    sulfate: validated.sulfate,
    turbidity: validated.turbidity,
    result: result,
    analysis_notes: analysisNotes
  })

  if (error) {
    console.error("Database error:", error)
    return { error: "Gagal menyimpan data ke database." }
  }

  revalidatePath('/dashboard/reports')
  
  return { 
    success: true, 
    result, 
    analysisNotes 
  }
}
