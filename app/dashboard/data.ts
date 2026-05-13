import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all classifications for the user (or all if admin, for now just user's)
  const { data, error } = await supabase
    .from('classifications')
    .select('*')
    .order('date', { ascending: false })

  if (error || !data) return null

  const total = data.length
  const layak = data.filter(i => i.result === 'layak').length
  const tidakLayak = total - layak
  
  // Calculate percentage
  const layakPercentage = total > 0 ? Math.round((layak / total) * 100) : 0

  // Group by date for trend
  const trendData = data.slice(0, 10).reverse().map(i => ({
    date: new Date(i.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    ph: i.ph,
    iron: i.iron,
    turbidity: i.turbidity
  }))

  return {
    total,
    layak,
    tidakLayak,
    layakPercentage,
    trendData,
    recentClassifications: data.slice(0, 5)
  }
}
