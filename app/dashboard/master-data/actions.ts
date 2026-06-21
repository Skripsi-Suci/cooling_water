'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper untuk validasi admin
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

// Helper untuk memeriksa apakah error disebabkan oleh tabel belum diinisialisasi
function isDbNotInitialized(error: any) {
  if (!error) return false;
  const msg = error.message || '';
  return (
    error.code === 'PGRST205' || 
    msg.includes('relation') && msg.includes('does not exist') ||
    msg.includes('Could not find the table')
  );
}

// ==========================================
// ACTIONS FOR UNITS
// ==========================================

export async function getUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('master_units')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error("Gagal mengambil data master_units:", error)
    return { 
      success: false, 
      error: error.message, 
      dbNotInitialized: isDbNotInitialized(error) 
    }
  }

  return { success: true, data }
}

export async function upsertUnit(payload: { id?: string; name: string; description?: string }) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }
  
  const supabase = await createClient()
  const { id, name, description } = payload

  if (!name || name.trim() === '') {
    return { success: false, error: 'Nama unit tidak boleh kosong' }
  }

  let result;
  if (id) {
    result = await supabase
      .from('master_units')
      .update({ name: name.trim(), description: description?.trim() })
      .eq('id', id)
  } else {
    result = await supabase
      .from('master_units')
      .insert({ name: name.trim(), description: description?.trim() })
  }

  if (result.error) {
    return { 
      success: false, 
      error: result.error.message, 
      dbNotInitialized: isDbNotInitialized(result.error) 
    }
  }

  revalidatePath('/dashboard/master-data')
  revalidatePath('/dashboard/input')
  return { success: true }
}

export async function deleteUnit(id: string) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('master_units')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/master-data')
  revalidatePath('/dashboard/input')
  return { success: true }
}

// ==========================================
// ACTIONS FOR ENGINES
// ==========================================

export async function getEngines() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('master_engines')
    .select('*')
    .order('engine_id', { ascending: true })

  if (error) {
    console.error("Gagal mengambil data master_engines:", error)
    return { 
      success: false, 
      error: error.message, 
      dbNotInitialized: isDbNotInitialized(error) 
    }
  }

  return { success: true, data }
}

export async function upsertEngine(payload: { id?: string; unit_name: string; engine_id: string; description?: string }) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { id, unit_name, engine_id, description } = payload

  if (!unit_name || unit_name.trim() === '') {
    return { success: false, error: 'Unit harus dipilih' }
  }
  if (!engine_id || engine_id.trim() === '') {
    return { success: false, error: 'Engine ID tidak boleh kosong' }
  }

  let result;
  if (id) {
    result = await supabase
      .from('master_engines')
      .update({ unit_name, engine_id: engine_id.trim(), description: description?.trim() })
      .eq('id', id)
  } else {
    result = await supabase
      .from('master_engines')
      .insert({ unit_name, engine_id: engine_id.trim(), description: description?.trim() })
  }

  if (result.error) {
    return { 
      success: false, 
      error: result.error.message, 
      dbNotInitialized: isDbNotInitialized(result.error) 
    }
  }

  revalidatePath('/dashboard/master-data')
  revalidatePath('/dashboard/input')
  return { success: true }
}

export async function deleteEngine(id: string) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('master_engines')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/master-data')
  revalidatePath('/dashboard/input')
  return { success: true }
}

// ==========================================
// ACTIONS FOR SOP PARAMETERS
// ==========================================

export async function getParameters() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('master_parameters')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error("Gagal mengambil data master_parameters:", error)
    return { 
      success: false, 
      error: error.message, 
      dbNotInitialized: isDbNotInitialized(error) 
    }
  }

  return { success: true, data }
}

export async function updateParameter(payload: { name: string; min_value: number; max_value: number; unit: string; description?: string }) {
  if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { name, min_value, max_value, unit, description } = payload

  const { error } = await supabase
    .from('master_parameters')
    .update({ 
      min_value: Number(min_value), 
      max_value: Number(max_value), 
      unit: unit.trim(),
      description: description?.trim() 
    })
    .eq('name', name)

  if (error) {
    return { 
      success: false, 
      error: error.message, 
      dbNotInitialized: isDbNotInitialized(error) 
    }
  }

  revalidatePath('/dashboard/master-data')
  revalidatePath('/dashboard/input')
  return { success: true }
}

export async function checkIsAdmin() {
  return { success: true, isAdmin: await checkAdmin() }
}

