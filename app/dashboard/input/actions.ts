'use server'

import { createClient } from '@/lib/supabase/server'
import { classificationSchema, type ClassificationInput } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function processClassification(data: ClassificationInput) {
  const supabase = await createClient()

  // Validate data
  const validated = classificationSchema.parse(data)

  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000'
  let flaskResponse;

  try {
    const res = await fetch(`${backendUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pH: validated.ph,
        SC: validated.sc,
        Nitrite: validated.nitrite,
        Fe: validated.iron,
        Sulfate: validated.sulfate,
        Turbidity: validated.turbidity,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${res.status}`)
    }

    flaskResponse = await res.json()
  } catch (err: any) {
    console.error("Failed to connect to Python backend:", err)
    return {
      success: false,
      error: `Gagal memproses data dengan model AI. Hubungi admin atau pastikan server Flask berjalan di port 5000. Detail: ${err.message || err}`
    }
  }

  // Determine final status for DB saving: 'layak' or 'tidak_layak'
  // Rules: If validasi_sop is "Tidak Layak" or status_prediksi is "Tidak Layak" -> 'tidak_layak'
  const result: 'layak' | 'tidak_layak' =
    (flaskResponse.validasi_sop === 'Tidak Layak' || flaskResponse.status_prediksi === 'Tidak Layak')
      ? 'tidak_layak'
      : 'layak'

  // Construct readable analysis notes
  const recommendationsText = flaskResponse.rekomendasi && flaskResponse.rekomendasi.length > 0
    ? ` Rekomendasi: ${flaskResponse.rekomendasi.join('; ')}`
    : ''
  const analysisNotes = `[Random Forest: ${flaskResponse.status_prediksi} (${flaskResponse.confidence_score}%)] [SOP: ${flaskResponse.validasi_sop}] ${flaskResponse.warning?.pesan || ''}.${recommendationsText}`

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Save to database
  const { error } = await supabase.from('classifications').insert({
    operator_id: user.id,
    date: validated.date ? new Date(validated.date).toISOString() : new Date().toISOString(),
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
    return { success: false, error: "Gagal menyimpan data ke database." }
  }

  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard')

  return {
    success: true,
    result,
    analysisNotes,
    details: flaskResponse
  }
}

export async function checkBackendStatus() {
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000'
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1500)

    const res = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return { online: res.ok }
  } catch (err) {
    return { online: false }
  }
}

