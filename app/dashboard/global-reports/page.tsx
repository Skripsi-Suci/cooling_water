import { getAllClassifications } from './actions'
import { columns } from './columns'
import { DataTable } from './data-table'
import { FileText, Database, ShieldAlert } from 'lucide-react'

export default async function GlobalReportsPage() {
  const result = await getAllClassifications()

  // Jika result.success false, itu karena user bukan admin atau error fetch
  if (!result.success) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
        <p className="text-slate-500 text-center max-w-md">
          Hanya Administrator yang memiliki izin untuk mengakses halaman Riwayat Semua User.
        </p>
      </div>
    )
  }

  const data = result.data || []

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" /> Riwayat Klasifikasi Global
          </h1>
          <p className="text-muted-foreground">Memantau seluruh riwayat hasil analisis dari semua user terdaftar.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50 text-sm font-medium">
          <Database className="w-4 h-4 text-primary" />
          <span>Total: {data.length} Record Global</span>
        </div>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
