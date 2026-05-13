import { createClient } from '@/lib/supabase/server'
import { columns } from './columns'
import { DataTable } from './data-table'
import { FileText, Database } from 'lucide-react'

async function getData() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('classifications')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error("Fetch error:", error)
    return []
  }

  return data
}

export default async function ReportsPage() {
  const data = await getData()

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" /> Riwayat Analisis
          </h1>
          <p className="text-muted-foreground">Kelola dan telusuri semua data klasifikasi cooling water.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50 text-sm font-medium">
          <Database className="w-4 h-4 text-primary" />
          <span>Total: {data.length} Record</span>
        </div>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
