'use server'

import { createClient } from '@/lib/supabase/server'

// Helper cek role admin
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function getAllClassifications() {
  if (!(await checkAdmin())) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Ambil data klasifikasi
  const { data: classifications, error: classificationsError } = await supabase
    .from('classifications')
    .select('*, iron:Fe')
    .order('date', { ascending: false })

  if (classificationsError) {
    console.error("Gagal mengambil data riwayat global:", classificationsError)
    return { success: false, error: classificationsError.message || JSON.stringify(classificationsError) }
  }

  // Ambil semua profil
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')

  if (profilesError) {
    console.error("Gagal mengambil data profiles:", profilesError)
  }

  // Map profil untuk pencarian cepat
  const profileMap = new Map()
  if (profiles) {
    profiles.forEach(p => {
      profileMap.set(p.id, p.full_name)
    })
  }

  // Gabungkan data
  const formattedData = classifications.map((item: any) => ({
    ...item,
    operator_name: profileMap.get(item.operator_id) || 'Operator Tidak Dikenal'
  }))

  return { success: true, data: formattedData }
}

export async function deleteClassification(id: string) {
  if (!(await checkAdmin())) {
    return { success: false, error: 'Unauthorized' }
  }

  // Gunakan admin client (service role) agar bypass RLS
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('classifications')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Gagal menghapus klasifikasi:", error)
    return { success: false, error: error.message }
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/dashboard/global-reports')

  return { success: true }
}
