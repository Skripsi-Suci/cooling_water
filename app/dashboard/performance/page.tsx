'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Play, Activity, Target, Zap, ShieldCheck, Trash2 } from 'lucide-react'
import { deletePerformanceResult, runModelTest } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

export default function PerformancePage() {
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const supabase = createClient()

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('model_performance')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error("Gagal memuat riwayat")
    } else {
      setHistory(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleRunTest = async () => {
    setTesting(true)
    const result = await runModelTest()
    if (result.success) {
      toast.success("Pengujian model selesai!")
      fetchHistory()
    } else {
      toast.error(result.error || "Gagal menguji model")
    }
    setTesting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pengujian ini?")) return
    
    const result = await deletePerformanceResult(id)
    if (result.success) {
      toast.success("Data berhasil dihapus")
      fetchHistory()
    } else {
      toast.error(result.error || "Gagal menghapus data")
    }
  }

  const latest = history[0]

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Model Performance</h1>
          <p className="text-slate-500 dark:text-slate-400">Analisis akurasi dan metrik performa model Random Forest.</p>
        </div>
        <Button onClick={handleRunTest} disabled={testing} className="shadow-lg shadow-primary/20 h-11 px-6 text-base font-semibold">
          {testing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
          Uji Performa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Accuracy', value: latest?.accuracy, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Precision', value: latest?.precision, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Recall', value: latest?.recall, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'F1 Score', value: latest?.f1_score, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg} dark:bg-slate-900`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <h3 className="text-2xl font-bold">
                    {stat.value ? `${(stat.value * 100).toFixed(2)}%` : '--'}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Riwayat Pengujian</CardTitle>
              <CardDescription>Daftar hasil pengujian model dari waktu ke waktu.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Activity className="h-12 w-12 opacity-20" />
                <p>Belum ada data pengujian. Silakan klik "Uji Performa".</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead>Waktu Pengujian</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1 Score</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {format(new Date(row.created_at), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell>{(row.accuracy * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(row.precision * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(row.recall * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(row.f1_score * 100).toFixed(2)}%</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(row.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
