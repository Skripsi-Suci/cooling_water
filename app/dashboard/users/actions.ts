'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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

export async function getUsers() {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }
  
  const supabase = await createClient()
  const admin = createAdminClient()
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (profileError) return { success: false, error: profileError.message }

  try {
    const { data: { users: authUsers }, error: authError } = await admin.auth.admin.listUsers()
    
    if (authError) {
      console.error("Gagal mengambil data auth users:", authError)
      return { success: true, data: profiles }
    }

    const mergedData = profiles.map((profile: any) => {
      const authUser = authUsers.find((u: any) => u.id === profile.id)
      return {
        ...profile,
        email: authUser ? authUser.email : null
      }
    })

    return { success: true, data: mergedData }
  } catch (err) {
    console.error("Exception saat listUsers:", err)
    return { success: true, data: profiles }
  }
}

export async function upsertUser(formData: any) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }
  
  const admin = createAdminClient()
  const { id, email, password, full_name, role } = formData

  if (id) {
    // Update existing profile
    const { error: profileError } = await admin
      .from('profiles')
      .update({ full_name, role })
      .eq('id', id)

    if (profileError) return { success: false, error: profileError.message }
  } else {
    // Create new user in Auth
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (authError) return { success: false, error: authError.message }

    // Profile will be created automatically by DB trigger, 
    // but we update it to ensure roles are correct
    await admin
      .from('profiles')
      .update({ full_name, role })
      .eq('id', authUser.user.id)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }
  
  const admin = createAdminClient()
  
  // Delete from Auth (will cascade to profile if FK is set, or we handle it)
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/users')
  return { success: true }
}
