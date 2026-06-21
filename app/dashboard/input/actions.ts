"use server"

import { createClient } from "@/lib/supabase/server"
import { classificationSchema, type ClassificationInput } from "@/lib/schema"
import { revalidatePath } from "next/cache"

const DEFAULT_BACKEND_URL =
  "https://huggingface.co/spaces/itsprzvl/model_randomforest_suci"

// Hugging Face membuat subdomain Space dengan meng-lowercase dan
// mengganti setiap karakter non-alfanumerik (mis. "_" dan ".") jadi "-".
// Contoh: "itsprzvl/model_randomforest_suci" -> "itsprzvl-model-randomforest-suci.hf.space"
function toHfSubdomainPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function resolveBackendBaseUrl() {
  const rawUrl = (process.env.BACKEND_API_URL || DEFAULT_BACKEND_URL)
    .trim()
    .replace(/\/+$/, "")

  try {
    const parsedUrl = new URL(rawUrl)

    if (
      parsedUrl.hostname === "huggingface.co" &&
      parsedUrl.pathname.startsWith("/spaces/")
    ) {
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean)
      const [, owner, spaceName] = pathParts
      if (owner && spaceName) {
        return `https://${toHfSubdomainPart(owner)}-${toHfSubdomainPart(spaceName)}.hf.space`
      }
    }

    return parsedUrl.toString()
  } catch {
    return rawUrl
  }
}

async function pingBackend(url: string, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })

    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function processClassification(data: ClassificationInput) {
  const supabase = await createClient()

  // Validate data
  const validated = classificationSchema.parse(data)

  // Fetch dynamic SOP limits from master_parameters
  let customLimitsPayload: Record<string, [number, number]> | undefined = undefined
  try {
    const { data: dbParams, error: dbError } = await supabase
      .from('master_parameters')
      .select('name, min_value, max_value')
      
    if (!dbError && dbParams && dbParams.length > 0) {
      customLimitsPayload = {}
      dbParams.forEach(param => {
        customLimitsPayload![param.name] = [param.min_value, param.max_value]
      })
    }
  } catch (dbErr) {
    console.warn("Gagal mengambil batas parameter dari database, menggunakan batas default backend:", dbErr)
  }

  const backendUrl = resolveBackendBaseUrl()
  let flaskResponse

  try {
    const res = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pH: validated.ph,
        SC: validated.sc,
        Nitrite: validated.nitrite,
        Fe: validated.iron,
        Sulfate: validated.sulfate,
        Turbidity: validated.turbidity,
        custom_limits: customLimitsPayload,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${res.status}`)
    }

    flaskResponse = await res.json()
  } catch (error: unknown) {
    console.error("Failed to connect to Python backend:", error)
    const detail = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: `Gagal memproses data dengan model AI. Hubungi admin atau pastikan Hugging Face Space model aktif. Detail: ${detail}`,
    }
  }

  // Determine final status for DB saving: 'layak' or 'tidak_layak'
  // Rules: If validasi_sop is "Tidak Layak" or status_prediksi is "Tidak Layak" -> 'tidak_layak'
  const result: "layak" | "tidak_layak" =
    flaskResponse.validasi_sop === "Tidak Layak" ||
    flaskResponse.status_prediksi === "Tidak Layak"
      ? "tidak_layak"
      : "layak"

  // Construct readable analysis notes
  const recommendationsText =
    flaskResponse.rekomendasi && flaskResponse.rekomendasi.length > 0
      ? ` Rekomendasi: ${flaskResponse.rekomendasi.join("; ")}`
      : ""
  const analysisNotes = `[Random Forest: ${flaskResponse.status_prediksi} (${flaskResponse.confidence_score}%)] [SOP: ${flaskResponse.validasi_sop}] ${flaskResponse.warning?.pesan || ""}.${recommendationsText}`

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Save to database
  const { error } = await supabase.from("classifications").insert({
    operator_id: user.id,
    date: validated.date
      ? new Date(validated.date).toISOString()
      : new Date().toISOString(),
    unit_name: validated.unit_name,
    engine_id: validated.engine_id,
    running_hour: validated.running_hour,
    ph: validated.ph,
    sc: validated.sc,
    nitrite: validated.nitrite,
    Fe: validated.iron, // kolom DB bernama "Fe" (case-sensitive), bukan "iron"
    sulfate: validated.sulfate,
    turbidity: validated.turbidity,
    result: result,
    analysis_notes: analysisNotes,
  })

  if (error) {
    console.error("Database error:", error)
    return {
      success: false,
      error: `Gagal menyimpan data ke database: ${error.message}`,
    }
  }

  revalidatePath("/dashboard/reports")
  revalidatePath("/dashboard")

  return {
    success: true,
    result,
    analysisNotes,
    details: flaskResponse,
  }
}

export async function checkBackendStatus() {
  const backendUrl = resolveBackendBaseUrl()
  const healthChecks = [`${backendUrl}/health`, `${backendUrl}/`]

  for (const endpoint of healthChecks) {
    if (await pingBackend(endpoint)) {
      return { online: true }
    }
  }

  return { online: false }
}
