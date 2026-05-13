'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classificationSchema, type ClassificationInput } from '@/lib/schema'
import { processClassification } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InputPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classificationResult, setClassificationResult] = useState<{
    result: 'layak' | 'tidak_layak'
    analysisNotes: string
  } | null>(null)

  const form = useForm<ClassificationInput>({
    resolver: zodResolver(classificationSchema) as any,
    defaultValues: {
      unit_name: 'Unit 1',
      engine_id: '',
      running_hour: 0,
      ph: 7,
      sc: 0,
      nitrite: 0,
      iron: 0,
      sulfate: 0,
      turbidity: 0,
    }
  })

  const onSubmit = async (data: ClassificationInput) => {
    setIsSubmitting(true)
    try {
      const response = await processClassification(data)
      if (response.success) {
        setClassificationResult({
          result: response.result as 'layak' | 'tidak_layak',
          analysisNotes: response.analysisNotes as string
        })
        toast.success("Klasifikasi berhasil!")
      } else {
        toast.error(response.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Gagal memproses data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setClassificationResult(null)
    form.reset()
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl px-4 lg:px-6">
      <AnimatePresence mode="wait">
        {!classificationResult ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-950">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Input Data Parameter Cooling Water</CardTitle>
              </CardHeader>
              <form onSubmit={form.handleSubmit(onSubmit as any)}>
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
                      <Select 
                        onValueChange={(val) => form.setValue('unit_name', val)}
                        defaultValue="Unit 1"
                      >
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11">
                          <SelectValue placeholder="Pilih Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unit 1">Unit 1</SelectItem>
                          <SelectItem value="Unit 2">Unit 2</SelectItem>
                          <SelectItem value="Unit 3">Unit 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engine_id" className="text-base font-medium">Engine</Label>
                      <Input 
                        id="engine_id" 
                        placeholder="ID Mesin" 
                        {...form.register('engine_id')} 
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                      />
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
                        <Label htmlFor="ph" className="text-base font-medium">pH</Label>
                        <Input id="ph" type="number" step="0.01" {...form.register('ph')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sc" className="text-base font-medium">SC</Label>
                        <Input id="sc" type="number" {...form.register('sc')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nitrite" className="text-base font-medium">Nitrite</Label>
                        <Input id="nitrite" type="number" {...form.register('nitrite')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iron" className="text-base font-medium">Fe</Label>
                        <Input id="iron" type="number" step="0.01" {...form.register('iron')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sulfate" className="text-base font-medium">Sulfate</Label>
                        <Input id="sulfate" type="number" {...form.register('sulfate')} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turbidity" className="text-base font-medium">Turbidity</Label>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <Card className={`border-2 ${classificationResult.result === 'layak' ? 'border-green-500/50 shadow-green-500/10' : 'border-red-500/50 shadow-red-500/10'} shadow-2xl`}>
              <CardHeader className={`${classificationResult.result === 'layak' ? 'bg-green-500/10' : 'bg-red-500/10'} text-center py-10`}>
                <div className="flex justify-center mb-4">
                  {classificationResult.result === 'layak' ? (
                    <div className="p-4 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30">
                      <CheckCircle2 className="w-16 h-16" />
                    </div>
                  ) : (
                    <div className="p-4 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30">
                      <AlertCircle className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <CardTitle className={`text-4xl font-extrabold uppercase tracking-widest ${classificationResult.result === 'layak' ? 'text-green-600' : 'text-red-600'}`}>
                  {classificationResult.result === 'layak' ? 'Layak' : 'Tidak Layak'}
                </CardTitle>
                <CardDescription className="text-lg mt-2 font-medium">Hasil Analisis Random Forest</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                  <h4 className="font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Catatan Analisis:
                  </h4>
                  <p className="text-lg leading-relaxed text-foreground/70">
                    {classificationResult.analysisNotes}
                  </p>
                </div>
              </CardContent>
              <div className="p-6 flex flex-col md:flex-row gap-4 justify-center">
                <Button variant="outline" className="md:w-1/3 h-12 text-lg" onClick={handleReset}>
                  Input Data Baru
                </Button>
                <Button className="md:w-1/3 h-12 text-lg" onClick={() => window.location.href = '/dashboard/reports'}>
                  Lihat Riwayat
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
