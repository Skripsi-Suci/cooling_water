-- 1. Aktifkan RLS pada tabel classifications
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy SELECT lama jika ada (untuk menghindari konflik)
DROP POLICY IF EXISTS "Allow select for owners" ON public.classifications;
DROP POLICY IF EXISTS "Allow select all for admin" ON public.classifications;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.classifications;

-- 3. Policy: User biasa (Operator) hanya bisa membaca data miliknya sendiri
CREATE POLICY "Allow select for owners" ON public.classifications
    FOR SELECT TO authenticated
    USING (
        auth.uid() = operator_id
    );

-- 4. Policy: Admin bisa membaca seluruh data klasifikasi
CREATE POLICY "Allow select all for admin" ON public.classifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. Policy: Mengizinkan insert data untuk semua user terautentikasi (operator hanya bisa insert ke ID mereka sendiri)
CREATE POLICY "Allow insert for authenticated users" ON public.classifications
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = operator_id
    );

-- 6. Policy: Admin bisa menghapus data klasifikasi
DROP POLICY IF EXISTS "Allow delete for admin" ON public.classifications;
CREATE POLICY "Allow delete for admin" ON public.classifications
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
