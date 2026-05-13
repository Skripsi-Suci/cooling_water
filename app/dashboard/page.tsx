import { getDashboardStats } from './data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendChart } from '@/components/charts/trend-chart'
import { StatusDistributionChart } from '@/components/charts/distribution-chart'
import { RecentClassifications } from '@/components/dashboard/recent-classifications'
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-primary/10 p-6 rounded-full mb-4">
          <Activity className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Belum Ada Data Klasifikasi</h2>
        <p className="text-muted-foreground max-w-md mt-2">
          Mulai masukkan data teknis cooling water untuk melihat analisis dan tren di sini.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/input">Input Data Baru</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Analitik</h1>
          <p className="text-muted-foreground">Monitoring kualitas cooling water secara real-time.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Link href="/dashboard/input" className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Mulai Klasifikasi
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analisis</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Analisis tersimpan</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Layak</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.layakPercentage}%</div>
            <p className="text-xs text-muted-foreground">{stats.layak} dari {stats.total} sampel</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Tidak Layak</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.tidakLayak}</div>
            <p className="text-xs text-muted-foreground">Memerlukan perhatian</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Update Terakhir</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate">
              {stats.recentClassifications[0] ? new Date(stats.recentClassifications[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Sinkronisasi Supabase</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Tren Parameter
            </CardTitle>
            <CardDescription>Fluktuasi pH, Besi (Fe), dan Turbidity pada 10 analisis terakhir.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <TrendChart data={stats.trendData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Distribusi Hasil
            </CardTitle>
            <CardDescription>Persentase kelayakan kualitas air.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart layak={stats.layak} tidakLayak={stats.tidakLayak} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6">
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
            <CardDescription>Data klasifikasi terbaru yang dimasukkan oleh operator.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentClassifications data={stats.recentClassifications} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
