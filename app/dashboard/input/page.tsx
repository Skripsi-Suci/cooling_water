'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { classificationSchema } from '@/lib/schema'
import { processClassification, checkBackendStatus } from './actions'
import { getUnits, getEngines, getParameters } from '@/app/dashboard/master-data/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  AlertTriangle,
  Info,
  Wrench,
  Gauge,
  Activity,
  TrendingUp,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FlaskResponse {
  status_prediksi: 'Layak' | 'Tidak Layak'
  confidence_score: number
  validasi_sop: 'Layak' | 'Tidak Layak'
  pelanggaran: string[]
  detail_validasi: Record<string, { nilai: number; min: number; max: number; status: 'Normal' | 'Tidak Normal' }>
  rekomendasi: string[]
  warning: { level: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL'; pesan: string }
  feature_importance: Record<string, number>
}

type ClassificationFormInput = z.input<typeof classificationSchema>
type ClassificationFormOutput = z.output<typeof classificationSchema>

export default function InputPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classificationResult, setClassificationResult] = useState<{
    result: 'layak' | 'tidak_layak'
    analysisNotes: string
    details: FlaskResponse
  } | null>(null)

  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const checkStatus = async () => {
    setApiStatus('checking')
    try {
      const status = await checkBackendStatus()
      setApiStatus(status.online ? 'online' : 'offline')
    } catch {
      setApiStatus('offline')
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkStatus()
    }, 0)
    const interval = setInterval(checkStatus, 15000)
    return () => {
      window.clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [])

  const getLocalCalendarDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const form = useForm<ClassificationFormInput, undefined, ClassificationFormOutput>({
    resolver: zodResolver(classificationSchema),
    defaultValues: {
      date: getLocalCalendarDateString(),
      unit_name: 'Unit 1',
      engine_id: '',
      running_hour: 0,
      ph: 0,
      sc: 0,
      nitrite: 0,
      iron: 0,
      sulfate: 0,
      turbidity: 0,
    }
  })

  // Master data states
  const [dbUnits, setDbUnits] = useState<any[]>([])
  const [dbEngines, setDbEngines] = useState<any[]>([])
  const [dbParams, setDbParams] = useState<any[]>([])
  const [isDbLoaded, setIsDbLoaded] = useState(false)

  useEffect(() => {
    async function loadMasterData() {
      try {
        const unitsRes = await getUnits()
        if (unitsRes.success && unitsRes.data && unitsRes.data.length > 0) {
          const enginesRes = await getEngines()
          const paramsRes = await getParameters()
          
          setDbUnits(unitsRes.data)
          if (enginesRes.success && enginesRes.data) setDbEngines(enginesRes.data)
          if (paramsRes.success && paramsRes.data) setDbParams(paramsRes.data)
          setIsDbLoaded(true)
          
          // Set default unit and first engine for it
          const defaultUnit = unitsRes.data[0].name
          form.setValue('unit_name', defaultUnit)
          
          if (enginesRes.success && enginesRes.data) {
            const firstEngine = enginesRes.data.find((e: any) => e.unit_name === defaultUnit)
            if (firstEngine) {
              form.setValue('engine_id', firstEngine.engine_id)
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat master data, menggunakan fallback statis:", err)
      }
    }
    loadMasterData()
  }, [])

  const getParamLimitText = (name: string, defaultText: string) => {
    const param = dbParams.find(p => p.name === name)
    if (!param) return defaultText
    
    if (name === 'SC' || name === 'Fe' || name === 'Sulfate' || name === 'Turbidity') {
      return `Standard: max ${param.max_value}${param.unit !== '-' ? ' ' + param.unit : ''}`
    }
    return `Standard: ${param.min_value} - ${param.max_value}${param.unit !== '-' ? ' ' + param.unit : ''}`
  }

  const onSubmit = async (data: ClassificationFormOutput) => {
    setIsSubmitting(true)
    try {
      let isoDate: string
      if (data.date) {
        const parts = data.date.split('-')
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        const now = new Date()
        const combined = new Date(
          year,
          month,
          day,
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds()
        )
        isoDate = combined.toISOString()
      } else {
        isoDate = new Date().toISOString()
      }

      const formattedData = {
        ...data,
        date: isoDate
      }
      const response = await processClassification(formattedData)
      if (response.success && response.details) {
        setApiStatus('online')
        setClassificationResult({
          result: response.result as 'layak' | 'tidak_layak',
          analysisNotes: response.analysisNotes as string,
          details: response.details as FlaskResponse
        })
        toast.success("Klasifikasi berhasil!")
      } else {
        toast.error(response.error || "Terjadi kesalahan")
      }
    } catch {
      toast.error("Gagal memproses data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setClassificationResult(null)
    const defaultUnit = dbUnits[0]?.name || 'Unit 1'
    const firstEngine = dbEngines.find(e => e.unit_name === defaultUnit)?.engine_id || ''
    
    form.reset({
      date: getLocalCalendarDateString(),
      unit_name: defaultUnit,
      engine_id: firstEngine,
      running_hour: 0,
      ph: 0,
      sc: 0,
      nitrite: 0,
      iron: 0,
      sulfate: 0,
      turbidity: 0,
    })
  }

  // Helper to get warning styles
  const getWarningStyles = (level: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL') => {
    switch (level) {
      case 'INFO':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900',
          text: 'text-emerald-800 dark:text-emerald-300',
          icon: CheckCircle2,
          badge: 'bg-emerald-500 text-white'
        }
      case 'WARNING':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900',
          text: 'text-amber-800 dark:text-amber-300',
          icon: AlertTriangle,
          badge: 'bg-amber-500 text-white'
        }
      case 'DANGER':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900',
          text: 'text-rose-800 dark:text-rose-300',
          icon: AlertCircle,
          badge: 'bg-rose-500 text-white'
        }
      case 'CRITICAL':
        return {
          bg: 'bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-800 animate-pulse border-2',
          text: 'text-red-900 dark:text-red-200 font-bold',
          icon: AlertCircle,
          badge: 'bg-red-700 text-white'
        }
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
          text: 'text-slate-800 dark:text-slate-200',
          icon: Info,
          badge: 'bg-slate-500 text-white'
        }
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl px-4 lg:px-6 space-y-6">
      {/* API Connection Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Klasifikasi Kualitas Cooling Water</h1>
            <p className="text-xs text-slate-500 font-medium">Klasifikasi kelayakan cooling water terintegrasi dengan model Random Forest dan Standar Nilai Parameter.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50 px-3.5 py-2 rounded-full border border-slate-150 dark:border-slate-850 shadow-inner self-start sm:self-auto">
          <div className={`w-2.5 h-2.5 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
              apiStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
            }`} />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
            {apiStatus === 'online' ? 'API Terhubung (Hugging Face Space)' :
              apiStatus === 'offline' ? 'API Terputus' : 'Memeriksa API...'}
          </span>
          <button
            type="button"
            onClick={checkStatus}
            disabled={apiStatus === 'checking'}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors ml-1"
            title="Periksa Koneksi"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-slate-400 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!classificationResult ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-950">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Input Data Parameter Cooling Water</CardTitle>
                <CardDescription>Masukkan data operasional dan parameter kualitas air untuk melakukan klasifikasi kelayakan.</CardDescription>
              </CardHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-8 space-y-10">
                  {/* Bagian 1: Identitas & Waktu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-base font-medium">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        {...form.register('date')}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit_name" className="text-base font-medium">Unit</Label>
                      {isDbLoaded ? (
                        <Select
                          onValueChange={(val) => {
                            form.setValue('unit_name', val)
                            // Cari engine pertama untuk unit ini
                            const engs = dbEngines.filter(e => e.unit_name === val)
                            if (engs.length > 0) {
                              form.setValue('engine_id', engs[0].engine_id)
                            } else {
                              form.setValue('engine_id', '')
                            }
                          }}
                          value={form.watch('unit_name')}
                        >
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11">
                            <SelectValue placeholder="Pilih Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {dbUnits.map((u) => (
                              <SelectItem key={u.id} value={u.name}>{u.name} {u.description ? `(${u.description})` : ''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select
                          onValueChange={(val) => form.setValue('unit_name', val)}
                          defaultValue="Unit 1"
                        >
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11">
                            <SelectValue placeholder="Pilih Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unit 1">Blok 1</SelectItem>
                            <SelectItem value="Unit 2">Blok 2</SelectItem>
                            <SelectItem value="Unit 3">Blok 3</SelectItem>
                            <SelectItem value="Unit 4">Blok 4</SelectItem>
                            <SelectItem value="TANK">TANK</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engine_id" className="text-base font-medium">Sample</Label>
                      {isDbLoaded ? (
                        <Select
                          onValueChange={(val) => form.setValue('engine_id', val)}
                          value={form.watch('engine_id')}
                        >
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11">
                            <SelectValue placeholder="Pilih Engine" />
                          </SelectTrigger>
                          <SelectContent>
                            {dbEngines
                              .filter(e => e.unit_name === form.watch('unit_name'))
                              .map(e => (
                                <SelectItem key={e.id} value={e.engine_id}>{e.engine_id} {e.description ? `(${e.description})` : ''}</SelectItem>
                              ))
                            }
                            {dbEngines.filter(e => e.unit_name === form.watch('unit_name')).length === 0 && (
                              <SelectItem value="-" disabled>Tidak ada engine di unit ini</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="engine_id"
                          placeholder="Engine ID"
                          {...form.register('engine_id')}
                          className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="running_hour" className="text-base font-medium">Running Hour</Label>
                      <Input
                        id="running_hour"
                        type="number"
                        step="0.1"
                        placeholder="Jam Operasi"
                        {...form.register('running_hour')}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Parameter Cooling Water</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="ph" className="text-base font-medium">pH ({getParamLimitText('pH', 'Standard: 8 - 11')})</Label>
                        <Input id="ph" type="number" step="0.01" {...form.register('ph')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sc" className="text-base font-medium">Specific Conductance (SC) ({getParamLimitText('SC', 'Standard: max 6000')})</Label>
                        <Input id="sc" type="number" {...form.register('sc')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nitrite" className="text-base font-medium">Nitrite ({getParamLimitText('Nitrite', 'Standard: 500 - 1500')})</Label>
                        <Input id="nitrite" type="number" {...form.register('nitrite')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iron" className="text-base font-medium">Fe (Besi) ({getParamLimitText('Fe', 'Standard: max 1.0')})</Label>
                        <Input id="iron" type="number" step="0.01" {...form.register('iron')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sulfate" className="text-base font-medium">Sulfate ({getParamLimitText('Sulfate', 'Standard: max 100')})</Label>
                        <Input id="sulfate" type="number" {...form.register('sulfate')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turbidity" className="text-base font-medium">Turbidity ({getParamLimitText('Turbidity', 'Standard: max 30')})</Label>
                        <Input id="turbidity" type="number" step="0.1" {...form.register('turbidity')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                  <Button variant="outline" type="button" onClick={() => form.reset()} disabled={isSubmitting} className="min-w-[140px] h-12 border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400">
                    Batal
                  </Button>
                  <Button type="submit" className="min-w-[180px] h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Klasifikasi'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 120 }}
            className="space-y-6"
          >
            {/* Top Main Result Card */}
            <Card className={`border-2 overflow-hidden ${classificationResult.result === 'layak'
              ? 'border-emerald-500/30 shadow-emerald-500/5 bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-950 dark:to-emerald-950/5'
              : 'border-rose-500/30 shadow-rose-500/5 bg-gradient-to-br from-white to-rose-50/20 dark:from-slate-950 dark:to-rose-950/5'
              } shadow-2xl`}>
              <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 gap-8">

                {/* Result Title & Icon */}
                <div className="flex items-center gap-6">
                  {classificationResult.result === 'layak' ? (
                    <div className="p-5 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-14 h-14" />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center">
                      <AlertCircle className="w-14 h-14" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status Kelayakan Air</span>
                    <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-wide ${classificationResult.result === 'layak' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                      {classificationResult.result === 'layak' ? 'LAYAK' : 'TIDAK LAYAK'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Sistem Klasifikasi Terpadu (SOP & Random Forest)</p>
                  </div>
                </div>

                {/* Confidence Score Gauge */}
                <div className="flex items-center gap-6 bg-slate-50/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="relative flex items-center justify-center w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className={classificationResult.result === 'layak' ? "stroke-emerald-500" : "stroke-rose-500"}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - classificationResult.details.confidence_score / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-bold text-slate-850 dark:text-slate-100">{classificationResult.details.confidence_score}%</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Confidence</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                      <Gauge className="w-4 h-4 text-primary" />
                      <span>Model RF</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Tingkat keyakinan klasifikasi dari model Random Forest.
                    </div>
                  </div>
                </div>

              </div>

              {/* Warning Message Card */}
              {(() => {
                const ws = getWarningStyles(classificationResult.details.warning.level);
                const Icon = ws.icon;
                return (
                  <div className={`m-8 p-5 rounded-2xl border ${ws.bg} flex items-start gap-4 transition-all duration-300`}>
                    <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 border shadow-sm`}>
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Warning System Level</span>
                        <Badge className={`${ws.badge} text-[10px] font-extrabold uppercase py-0.5 px-2 tracking-widest`}>
                          {classificationResult.details.warning.level}
                        </Badge>
                      </div>
                      <p className={`text-base leading-relaxed ${ws.text}`}>
                        {classificationResult.details.warning.pesan}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* Grid for comparison table, recommendations, feature importance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Side: Parameters Table & Feature Importance */}
              <div className="lg:col-span-7 space-y-6">

                {/* SOP Standard Comparison */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <span>Detail Validasi Standar SOP</span>
                    </CardTitle>
                    <CardDescription>Perbandingan nilai input parameter dengan batas operasional standar.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3.5 pl-5">Parameter</th>
                            <th className="p-3.5 text-center">Nilai Input</th>
                            <th className="p-3.5 text-center">Batas SOP</th>
                            <th className="p-3.5 pr-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {Object.entries(classificationResult.details.detail_validasi).map(([key, data]) => {
                            const displayName = key === 'Fe' ? 'Fe (Besi)' : key;
                            return (
                              <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                <td className="p-3.5 pl-5 font-semibold text-slate-700 dark:text-slate-350">{displayName}</td>
                                <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-slate-100">{data.nilai}</td>
                                <td className="p-3.5 text-center text-slate-500 font-medium">{data.min} - {data.max}</td>
                                <td className="p-3.5 pr-5 text-right">
                                  <Badge className={
                                    data.status === 'Normal'
                                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold'
                                      : 'bg-rose-500 hover:bg-rose-600 text-white font-semibold'
                                  }>
                                    {data.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Importance Charts */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span>Kontribusi Pengaruh Parameter (RF)</span>
                    </CardTitle>
                    <CardDescription>Seberapa signifikan parameter memengaruhi hasil prediksi model.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 space-y-4">
                    {Object.entries(classificationResult.details.feature_importance)
                      .sort((a, b) => b[1] - a[1])
                      .map(([key, val]) => {
                        const percentage = (val * 100).toFixed(1);
                        const displayName = key === 'Fe' ? 'Fe (Besi)' : key;
                        return (
                          <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                              <span>{displayName}</span>
                              <span className="font-mono">{percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${classificationResult.result === 'layak'
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                                  }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>

              </div>

              {/* Right Side: Recommendations & Full Narrative */}
              <div className="lg:col-span-5 space-y-6">

                {/* Actionable Recommendations */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      <span>Rekomendasi Tindakan</span>
                    </CardTitle>
                    <CardDescription>Saran perbaikan kualitas air pendingin berdasarkan standar batasan SOP.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 flex-1 flex flex-col justify-between">

                    {/* Recommendation List */}
                    <div className="space-y-3">
                      {classificationResult.details.rekomendasi.length > 0 &&
                        classificationResult.details.rekomendasi[0] !== 'Semua parameter dalam kondisi optimal' ? (
                        classificationResult.details.rekomendasi.map((rec, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 text-sm text-slate-700 dark:text-slate-350">
                            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm shadow-amber-500/20">
                              {index + 1}
                            </div>
                            <p className="leading-relaxed font-medium">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-3 p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-sm text-slate-750 dark:text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed font-medium">Semua parameter dalam kondisi optimal. Tidak ada tindakan pemulihan yang diperlukan.</p>
                        </div>
                      )}
                    </div>

                    {/* Historical Notes Box */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 space-y-2">
                      <h4 className="font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Catatan Riwayat (Database)</span>
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-500 font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        {classificationResult.analysisNotes}
                      </p>
                    </div>

                  </CardContent>
                </Card>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="sm:w-1/3 h-12 text-base font-semibold border-slate-300 dark:border-slate-800" onClick={handleReset}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Input Data Baru
              </Button>
              <Button className="sm:w-1/3 h-12 text-base font-semibold" onClick={() => window.location.href = '/dashboard/reports'}>
                Lihat Riwayat Analisis
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

