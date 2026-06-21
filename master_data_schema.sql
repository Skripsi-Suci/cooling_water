-- ==========================================
-- SQL SCHEMA FOR MASTER DATA MANAGEMENT
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- ==========================================

-- 1. Tabel Master Unit
CREATE TABLE IF NOT EXISTS public.master_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Master Engine
CREATE TABLE IF NOT EXISTS public.master_engines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_name TEXT NOT NULL,
    engine_id TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Master Parameter SOP
CREATE TABLE IF NOT EXISTS public.master_parameters (
    name TEXT PRIMARY KEY,
    min_value DOUBLE PRECISION NOT NULL,
    max_value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- KEAMANAN / ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.master_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_parameters ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.master_units;
DROP POLICY IF EXISTS "Allow all for admin" ON public.master_units;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.master_engines;
DROP POLICY IF EXISTS "Allow all for admin" ON public.master_engines;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.master_parameters;
DROP POLICY IF EXISTS "Allow all for admin" ON public.master_parameters;

-- Policy untuk Tabel Master Unit
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

-- Policy untuk Tabel Master Engine
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

-- Policy untuk Tabel Master Parameter SOP
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

-- ==========================================
-- DATA BAWAAN / SEED DATA
-- ==========================================

-- Data Bawaan Unit
INSERT INTO public.master_units (name, description) VALUES
('Unit 1', 'Blok 1'),
('Unit 2', 'Blok 2'),
('Unit 3', 'Blok 3'),
('Unit 4', 'Blok 4'),
('TANK', 'Storage Tank')
ON CONFLICT (name) DO NOTHING;

-- Data Bawaan Engine
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

-- Data Bawaan Parameter SOP
INSERT INTO public.master_parameters (name, min_value, max_value, unit, description) VALUES
('pH', 8.0, 11.0, '-', 'Derajat keasaman air pendingin'),
('SC', 0.0, 6000.0, 'µS/cm', 'Specific Conductance / Daya Hantar Listrik'),
('Nitrite', 500.0, 1500.0, 'ppm', 'Kandungan Nitrit (Inhibitor)'),
('Fe', 0.0, 1.0, 'ppm', 'Kandungan Besi (Indikator Korosi)'),
('Sulfate', 0.0, 100.0, 'ppm', 'Kandungan Sulfat'),
('Turbidity', 0.0, 30.0, 'NTU', 'Kekeruhan air pendingin')
ON CONFLICT (name) DO NOTHING;
