'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
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
    resolver: zodResolver(classificationSchema),
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

  const onSubmit: SubmitHandler<ClassificationInput> = async (data) => {
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
            <Card className="border-border/50 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border/50">
                <CardTitle className="text-2xl font-bold text-primary">Input Parameter Air</CardTitle>
                <CardDescription>Masukkan data teknis cooling water untuk klasifikasi otomatis.</CardDescription>
              </CardHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-6 space-y-8">
                  {/* Bagian A: Identitas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">A</span>
                      Identitas Unit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="unit_name">Unit Mesin</Label>
                        <Select 
                          onValueChange={(val) => form.setValue('unit_name', val)}
                          defaultValue="Unit 1"
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Pilih Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unit 1">Unit 1 - GT 1.1</SelectItem>
                            <SelectItem value="Unit 2">Unit 2 - GT 1.2</SelectItem>
                            <SelectItem value="Unit 3">Unit 3 - GT 1.3</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.unit_name && <p className="text-xs text-destructive">{form.formState.errors.unit_name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engine_id">Engine ID</Label>
                        <Input 
                          id="engine_id" 
                          placeholder="Contoh: E102-X" 
                          {...form.register('engine_id')} 
                          className="bg-background/50"
                        />
                        {form.formState.errors.engine_id && <p className="text-xs text-destructive">{form.formState.errors.engine_id.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="running_hour">Running Hour (Hours)</Label>
                        <Input 
                          id="running_hour" 
                          type="number" 
                          step="0.1"
                          placeholder="0.0" 
                          {...form.register('running_hour')} 
                          className="bg-background/50"
                        />
                        {form.formState.errors.running_hour && <p className="text-xs text-destructive">{form.formState.errors.running_hour.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Bagian B: Parameter Teknis */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">B</span>
                      Parameter Teknis (Kimia)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="ph">pH</Label>
                        <Input id="ph" type="number" step="0.01" {...form.register('ph')} className="bg-background/50" />
                        {form.formState.errors.ph && <p className="text-xs text-destructive">{form.formState.errors.ph.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sc">SC (µS/cm)</Label>
                        <Input id="sc" type="number" {...form.register('sc')} className="bg-background/50" />
                        {form.formState.errors.sc && <p className="text-xs text-destructive">{form.formState.errors.sc.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nitrite">Nitrite (mg/L)</Label>
                        <Input id="nitrite" type="number" {...form.register('nitrite')} className="bg-background/50" />
                        {form.formState.errors.nitrite && <p className="text-xs text-destructive">{form.formState.errors.nitrite.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iron">Fe / Besi (mg/L)</Label>
                        <Input id="iron" type="number" step="0.01" {...form.register('iron')} className="bg-background/50" />
                        {form.formState.errors.iron && <p className="text-xs text-destructive">{form.formState.errors.iron.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sulfate">Sulfate (mg/L)</Label>
                        <Input id="sulfate" type="number" {...form.register('sulfate')} className="bg-background/50" />
                        {form.formState.errors.sulfate && <p className="text-xs text-destructive">{form.formState.errors.sulfate.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turbidity">Turbidity (NTU)</Label>
                        <Input id="turbidity" type="number" step="0.1" {...form.register('turbidity')} className="bg-background/50" />
                        {form.formState.errors.turbidity && <p className="text-xs text-destructive">{form.formState.errors.turbidity.message}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 bg-muted/30 border-t border-border/50 flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => form.reset()} disabled={isSubmitting}>
                    Batal
                  </Button>
                  <Button type="submit" className="min-w-[150px]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menganalisis...
                      </>
                    ) : (
                      'Mulai Klasifikasi'
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
