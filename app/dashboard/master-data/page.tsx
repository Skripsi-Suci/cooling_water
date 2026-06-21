'use client'

import { useState, useEffect } from 'react'
import { 
  checkIsAdmin, 
  getUnits, 
  getEngines, 
  getParameters, 
  upsertUnit, 
  deleteUnit, 
  upsertEngine, 
  deleteEngine, 
  updateParameter 
} from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Loader2, 
  Shield, 
  Database, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  Copy, 
  RefreshCcw, 
  LayoutGrid, 
  Cpu, 
  SlidersHorizontal 
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function MasterDataPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dbNotInitialized, setDbNotInitialized] = useState(false)
  
  // Data States
  const [units, setUnits] = useState<any[]>([])
  const [engines, setEngines] = useState<any[]>([])
  const [parameters, setParameters] = useState<any[]>([])

  // Modal Dialog States
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)
  const [isEngineDialogOpen, setIsEngineDialogOpen] = useState(false)
  const [isParamDialogOpen, setIsParamDialogOpen] = useState(false)
  
  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Editing Target States
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [editingEngine, setEditingEngine] = useState<any>(null)
  const [editingParam, setEditingParam] = useState<any>(null)
  
  // SQL Copy State
  const [copied, setCopied] = useState(false)

  const SQL_SCRIPT = `-- ==========================================
-- SQL SCHEMA FOR MASTER DATA MANAGEMENT
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- ==========================================

CREATE TABLE IF NOT EXISTS public.master_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.master_engines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_name TEXT NOT NULL,
    engine_id TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.master_parameters (
    name TEXT PRIMARY KEY,
    min_value DOUBLE PRECISION NOT NULL,
    max_value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.master_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_parameters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.master_units;
DROP POLICY IF EXISTS "Allow all for admin" ON public.master_units;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.master_engines;
DROP POLICY IF EXISTS "Allow all for admin" ON public.master_engines;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.master_parameters;
DROP POLICY IF EXISTS "Allow all for admin" ON public.master_parameters;

CREATE POLICY "Allow select for authenticated users" ON public.master_units
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for admin" ON public.master_units
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow select for authenticated users" ON public.master_engines
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for admin" ON public.master_engines
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow select for authenticated users" ON public.master_parameters
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for admin" ON public.master_parameters
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

INSERT INTO public.master_units (name, description) VALUES
('Unit 1', 'Blok 1'),
('Unit 2', 'Blok 2'),
('Unit 3', 'Blok 3'),
('Unit 4', 'Blok 4'),
('TANK', 'Storage Tank')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.master_engines (unit_name, engine_id, description) VALUES
('Unit 1', 'UL 1', 'Engine 1 Blok 1'),
('Unit 1', 'UL 2', 'Engine 2 Blok 1'),
('Unit 2', 'UL 3', 'Engine 3 Blok 2'),
('Unit 2', 'UL 4', 'Engine 4 Blok 2'),
('Unit 3', 'UL 5', 'Engine 5 Blok 3'),
('Unit 4', 'UL 6', 'Engine 6 Blok 4'),
('TANK', 'TANK 1', 'Storage Tank 1'),
('TANK', 'TANK 2', 'Storage Tank 2')
ON CONFLICT (engine_id) DO NOTHING;

INSERT INTO public.master_parameters (name, min_value, max_value, unit, description) VALUES
('pH', 8.0, 11.0, '-', 'Derajat keasaman air pendingin'),
('SC', 0.0, 6000.0, 'µS/cm', 'Specific Conductance / Daya Hantar Listrik'),
('Nitrite', 500.0, 1500.0, 'ppm', 'Kandungan Nitrit (Inhibitor)'),
('Fe', 0.0, 1.0, 'ppm', 'Kandungan Besi (Indikator Korosi)'),
('Sulfate', 0.0, 100.0, 'ppm', 'Kandungan Sulfat'),
('Turbidity', 0.0, 30.0, 'NTU', 'Kekeruhan air pendingin')
ON CONFLICT (name) DO NOTHING;`

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT)
      setCopied(true)
      toast.success("Skrip SQL berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Gagal menyalin skrip.")
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      const adminRes = await checkIsAdmin()
      if (!adminRes.success || !adminRes.isAdmin) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)

      // Ambil data Unit
      const unitsRes = await getUnits()
      if (!unitsRes.success) {
        if (unitsRes.dbNotInitialized) {
          setDbNotInitialized(true)
          setLoading(false)
          return
        } else {
          toast.error(unitsRes.error || "Gagal memuat data unit")
        }
      } else {
        setUnits(unitsRes.data || [])
        setDbNotInitialized(false)
      }

      // Ambil data Engine
      const enginesRes = await getEngines()
      if (enginesRes.success) {
        setEngines(enginesRes.data || [])
      }

      // Ambil data Parameter SOP
      const paramsRes = await getParameters()
      if (paramsRes.success) {
        setParameters(paramsRes.data || [])
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // ==========================================
  // HANDLERS FOR UNITS
  // ==========================================
  const handleUnitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    
    const payload = {
      id: editingUnit?.id,
      name,
      description
    }

    const res = await upsertUnit(payload)
    if (res.success) {
      toast.success(editingUnit ? "Unit diperbarui" : "Unit ditambahkan")
      setIsUnitDialogOpen(false)
      loadAllData()
    } else {
      toast.error(res.error || "Gagal menyimpan unit")
    }
    setIsSubmitting(false)
  }

  const handleUnitDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus unit "${name}" secara permanen? Menghapus unit juga akan berdampak pada engine terkait.`)) return
    
    const res = await deleteUnit(id)
    if (res.success) {
      toast.success("Unit berhasil dihapus")
      loadAllData()
    } else {
      toast.error(res.error || "Gagal menghapus unit")
    }
  }

  // ==========================================
  // HANDLERS FOR ENGINES
  // ==========================================
  const handleEngineSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const unit_name = formData.get('unit_name') as string
    const engine_id = formData.get('engine_id') as string
    const description = formData.get('description') as string
    
    const payload = {
      id: editingEngine?.id,
      unit_name,
      engine_id,
      description
    }

    const res = await upsertEngine(payload)
    if (res.success) {
      toast.success(editingEngine ? "Engine diperbarui" : "Engine ditambahkan")
      setIsEngineDialogOpen(false)
      loadAllData()
    } else {
      toast.error(res.error || "Gagal menyimpan engine")
    }
    setIsSubmitting(false)
  }

  const handleEngineDelete = async (id: string, engine_id: string) => {
    if (!confirm(`Hapus engine "${engine_id}" secara permanen?`)) return
    
    const res = await deleteEngine(id)
    if (res.success) {
      toast.success("Engine berhasil dihapus")
      loadAllData()
    } else {
      toast.error(res.error || "Gagal menghapus engine")
    }
  }

  // ==========================================
  // HANDLERS FOR PARAMETERS
  // ==========================================
  const handleParamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const min_value = parseFloat(formData.get('min_value') as string)
    const max_value = parseFloat(formData.get('max_value') as string)
    const unit = formData.get('unit') as string
    const description = formData.get('description') as string
    
    const payload = {
      name: editingParam.name,
      min_value,
      max_value,
      unit,
      description
    }

    const res = await updateParameter(payload)
    if (res.success) {
      toast.success(`Batas parameter ${editingParam.name} diperbarui`)
      setIsParamDialogOpen(false)
      loadAllData()
    } else {
      toast.error(res.error || "Gagal memperbarui parameter")
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Shield className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
        <p className="text-slate-500 text-center max-w-md">
          Hanya Administrator yang memiliki izin untuk mengakses halaman pengelolaan master data.
        </p>
      </div>
    )
  }

  if (dbNotInitialized) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Database className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Database Belum Terinisialisasi</h1>
            <p className="text-slate-500">Tabel master data tidak ditemukan di database Supabase Anda.</p>
          </div>
        </div>

        <Card className="border-amber-200 dark:border-amber-900/30 bg-gradient-to-br from-white to-amber-50/10 dark:from-slate-950 dark:to-amber-950/5 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-600 dark:text-amber-400">Instruksi Inisialisasi Database</CardTitle>
            <CardDescription className="text-sm">
              Silakan salin skrip SQL di bawah ini, lalu jalankan di **SQL Editor** pada dashboard proyek Supabase Anda. Skrip ini akan membuat tabel master data dan mengisi nilai bawaan standar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="p-5 rounded-2xl bg-slate-950 text-slate-250 font-mono text-xs overflow-x-auto max-h-[350px] border border-slate-800 shadow-inner">
                <code>{SQL_SCRIPT}</code>
              </pre>
              <Button 
                onClick={handleCopySQL}
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-white shadow-md"
              >
                {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? "Tersalin" : "Salin SQL"}
              </Button>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button 
                onClick={loadAllData} 
                className="shadow-lg shadow-primary/20 h-11 px-6 font-bold flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Segarkan Halaman
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Database className="w-8 h-8 text-primary" /> Kelola Master Data
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Konfigurasi Unit, Mesin/Engine, dan batas standar parameter SOP kualitas air pendingin.</p>
        </div>
      </div>

      <Tabs defaultValue="units" className="w-full space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-full inline-flex border border-slate-200/50 dark:border-slate-800/30">
          <TabsTrigger value="units" className="flex items-center gap-2 py-2 px-5">
            <LayoutGrid className="w-4 h-4" />
            Unit Pembangkit
          </TabsTrigger>
          <TabsTrigger value="engines" className="flex items-center gap-2 py-2 px-5">
            <Cpu className="w-4 h-4" />
            Engine / Mesin
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center gap-2 py-2 px-5">
            <SlidersHorizontal className="w-4 h-4" />
            Batas Parameter (SOP)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: UNIT PEMBANGKIT */}
        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Unit Pembangkit</h2>
              <p className="text-xs text-slate-500">Kelola kelompok pembangkit utama (misal: Unit 1, Unit 2, TANK).</p>
            </div>
            
            <Dialog open={isUnitDialogOpen} onOpenChange={(open) => {
              setIsUnitDialogOpen(open)
              if (!open) setEditingUnit(null)
            }}>
              <DialogTrigger asChild>
                <Button className="shadow-md shadow-primary/20 h-10 px-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tambah Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleUnitSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingUnit ? 'Edit Unit Pembangkit' : 'Tambah Unit Baru'}</DialogTitle>
                    <DialogDescription>
                      Tambahkan unit pembangkit baru ke dalam sistem master data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Unit</Label>
                      <Input id="name" name="name" defaultValue={editingUnit?.name} required placeholder="Contoh: Unit 5 atau TANK B" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Input id="description" name="description" defaultValue={editingUnit?.description} placeholder="Contoh: Blok 5 atau Tangki Cadangan" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {editingUnit ? 'Simpan Perubahan' : 'Simpan Unit'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200 dark:border-slate-850 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-55/60 dark:bg-slate-900/40">
                    <TableHead className="w-[180px]">Nama Unit</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="w-[180px]">Dibuat Tanggal</TableHead>
                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500 font-medium">Belum ada data unit.</TableCell>
                    </TableRow>
                  ) : (
                    units.map((unit) => (
                      <TableRow key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100">{unit.name}</TableCell>
                        <TableCell className="text-slate-500">{unit.description || '-'}</TableCell>
                        <TableCell className="text-slate-400 text-xs">
                          {new Date(unit.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => {
                              setEditingUnit(unit)
                              setIsUnitDialogOpen(true)
                            }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleUnitDelete(unit.id, unit.name)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ENGINE / MESIN */}
        <TabsContent value="engines" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Engine / ID Mesin</h2>
              <p className="text-xs text-slate-500">Kelola ID mesin spesifik yang terkait dengan masing-masing unit pembangkit.</p>
            </div>
            
            <Dialog open={isEngineDialogOpen} onOpenChange={(open) => {
              setIsEngineDialogOpen(open)
              if (!open) setEditingEngine(null)
            }}>
              <DialogTrigger asChild>
                <Button className="shadow-md shadow-primary/20 h-10 px-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tambah Engine
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleEngineSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingEngine ? 'Edit Engine' : 'Tambah Engine Baru'}</DialogTitle>
                    <DialogDescription>
                      Masukkan data mesin dan tautkan ke salah satu Unit Pembangkit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit_name">Tautkan ke Unit</Label>
                      <Select name="unit_name" defaultValue={editingEngine?.unit_name || (units[0]?.name || '')}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engine_id">Engine ID / Kode Mesin</Label>
                      <Input id="engine_id" name="engine_id" defaultValue={editingEngine?.engine_id} required placeholder="Contoh: UL 5 atau TANK-A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Input id="description" name="description" defaultValue={editingEngine?.description} placeholder="Contoh: Engine 1 Blok 5" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {editingEngine ? 'Simpan Perubahan' : 'Simpan Engine'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200 dark:border-slate-855 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-55/60 dark:bg-slate-900/40">
                    <TableHead className="w-[180px]">Engine ID</TableHead>
                    <TableHead className="w-[180px]">Unit Pembangkit</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="w-[180px]">Dibuat Tanggal</TableHead>
                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium">Belum ada data engine. Buat unit terlebih dahulu.</TableCell>
                    </TableRow>
                  ) : (
                    engines.map((eng) => (
                      <TableRow key={eng.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100">{eng.engine_id}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {eng.unit_name}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500">{eng.description || '-'}</TableCell>
                        <TableCell className="text-slate-400 text-xs">
                          {new Date(eng.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => {
                              setEditingEngine(eng)
                              setIsEngineDialogOpen(true)
                            }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleEngineDelete(eng.id, eng.engine_id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BATAS PARAMETER (SOP) */}
        <TabsContent value="parameters" className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Batas Operasional Kualitas Air (SOP)</h2>
            <p className="text-xs text-slate-500">Sesuaikan batas minimum dan maksimum parameter air pendingin. Perubahan akan langsung tecermin pada antarmuka input dan validasi laporan.</p>
          </div>

          <Dialog open={isParamDialogOpen} onOpenChange={(open) => {
            setIsParamDialogOpen(open)
            if (!open) setEditingParam(null)
          }}>
            <DialogContent className="sm:max-w-[425px]">
              {editingParam && (
                <form onSubmit={handleParamSubmit}>
                  <DialogHeader>
                    <DialogTitle>Konfigurasi Parameter: {editingParam.name}</DialogTitle>
                    <DialogDescription>
                      Perbarui rentang kelayakan standar operasional untuk parameter ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_value">Batas Minimum</Label>
                        <Input id="min_value" name="min_value" type="number" step="0.01" defaultValue={editingParam.min_value} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_value">Batas Maksimum</Label>
                        <Input id="max_value" name="max_value" type="number" step="0.01" defaultValue={editingParam.max_value} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Satuan Parameter</Label>
                      <Input id="unit" name="unit" defaultValue={editingParam.unit} required placeholder="Contoh: ppm, NTU, atau -" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Keterangan / Deskripsi</Label>
                      <Input id="description" name="description" defaultValue={editingParam.description} placeholder="Keterangan singkat fungsi parameter" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Simpan Batas SOP
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Card className="border-slate-200 dark:border-slate-855 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-55/60 dark:bg-slate-900/40">
                    <TableHead className="w-[150px]">Nama Parameter</TableHead>
                    <TableHead className="w-[180px] text-center font-bold">Batas Normal SOP</TableHead>
                    <TableHead className="w-[100px] text-center">Satuan</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium font-mono">Memuat data parameter...</TableCell>
                    </TableRow>
                  ) : (
                    parameters.map((param) => (
                      <TableRow key={param.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <TableCell className="font-extrabold text-slate-900 dark:text-slate-100">{param.name}</TableCell>
                        <TableCell className="text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {param.min_value} — {param.max_value}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs text-slate-600 dark:text-slate-350">
                            {param.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{param.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => {
                            setEditingParam(param)
                            setIsParamDialogOpen(true)
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
