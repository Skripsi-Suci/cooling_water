# 🚀 MVP Plan: Sistem Klasifikasi Kelayakan Cooling Water
**Studi Kasus:** PT PLN Nusantara Power UP Arun
**Algoritma:** Random Forest

---

## 📋 Ringkasan Proyek
Sistem ini dirancang untuk mendigitalisasi proses klasifikasi kualitas air pendingin (*cooling water*) pada unit pembangkit listrik. Menggunakan algoritma **Random Forest**, sistem akan memberikan keputusan cepat apakah kondisi air **"Layak"** atau **"Tidak Layak"** berdasarkan parameter teknis, guna mencegah kerusakan pada mesin pembangkit.

---

## 🛠️ Tech Stack (Rekomendasi)
Untuk membangun MVP yang cepat, stabil, dan memiliki estetika premium:

| Layer | Teknologi | Alasan |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (React) | Performa tinggi, SEO-friendly, dan routing yang solid. |
| **Styling** | Tailwind CSS + Framer Motion | Desain modern, responsif, dan animasi transisi yang halus. |
| **Database & Auth** | Supabase (PostgreSQL) | Backend-as-a-Service yang cepat untuk manajemen user dan data historis. |
| **Algorithm** | Random Forest (ML-JS / Python API) | Implementasi algoritma klasifikasi sesuai kebutuhan riset. |
| **Charts** | Recharts / Chart.js | Visualisasi tren dan distribusi data yang interaktif. |

---

## 👥 Hak Akses & Fitur Utama

### 1. Fitur Admin (Super User)
*   **Authentication:** Login aman ke sistem.
*   **User Management:** CRUD (Create, Read, Update, Delete) akun operator & Reset password.
*   **Centralized Data Access:** Melihat seluruh riwayat klasifikasi dari semua unit.
*   **Reporting:** Generate laporan PDF/Excel dengan filter periode & unit mesin.
*   **Model Analytics:** Dashboard khusus evaluasi model (Accuracy, Precision, Recall, F1-Score, Confusion Matrix, & Feature Importance).

### 2. Fitur Operator (User)
*   **Authentication:** Login ke sistem.
*   **Data Entry:** Input parameter teknis (pH, SC, Nitrite, Fe, Sulfate, Turbidity).
*   **Smart Classification:** Menjalankan algoritma Random Forest secara real-time.
*   **Result Persistence:** Melihat hasil analisis dan menyimpan data ke database.

---

## 🖼️ Arsitektur Antarmuka (6 Halaman Utama)

### 1. Halaman Login
*   **UI:** Minimalist card dengan latar belakang gradien premium/glassmorphism.
*   **Elemen:** Input Username, Password, dan Button Login dengan efek loading.

### 2. Halaman Dashboard
*   **Statistik (Cards):**
    *   Total Klasifikasi (Cumulative)
    *   Jumlah "Layak" (Green Accent)
    *   Jumlah "Tidak Layak" (Red/Amber Accent)
    *   Total User Terdaftar
*   **Visualisasi:**
    *   Grafik Tren Kelayakan (Line Chart) per bulan.
    *   Diagram Persentase Kelayakan (Pie/Donut Chart).

### 3. Halaman Input Data
*   **Bagian A (Identitas):** Tanggal, Unit, Engine, Running Hour.
*   **Bagian B (Parameter Teknis):** pH, Specific Conductivity (SC), Nitrite, Besi (Fe), Sulfate, Turbidity.
*   **Aksi:** Tombol "Klasifikasi" (Primary) & "Batal" (Ghost/Outline).

### 4. Halaman Hasil Klasifikasi
*   **Highlight Result:** Badge besar bertuliskan **LAYAK** atau **TIDAK LAYAK**.
*   **Analisis:** Deskripsi otomatis berdasarkan parameter yang menyimpang dari standar.
*   **Aksi:** Tombol "Kembali ke Input" atau "Lihat di Riwayat".

### 5. Halaman Report (Historical Data)
*   **Table View:** List data dengan pagination.
*   **Fitur:** Global Search, Date Range Picker, Filter by Unit.
*   **Export:** Button "Download Report" (CSV/PDF).

### 6. Halaman Kelola User (Admin Only)
*   **Management Table:** Nama, Username, Level (Role), Last Login.
*   **Aksi:** Modal untuk Tambah/Edit User & Dialog Konfirmasi Hapus.

---

## 🗄️ Struktur Database (Supabase)

### Table: `users`
*   `id` (UUID, PK)
*   `full_name` (Text)
*   `username` (Text, Unique)
*   `password` (Hashed)
*   `role` (Enum: 'admin', 'operator')

### Table: `classifications`
*   `id` (UUID, PK)
*   `operator_id` (FK to users)
*   `date` (Timestamp)
*   `unit_name` (Text)
*   `engine_id` (Text)
*   `running_hour` (Float)
*   **Parameters:** `ph`, `sc`, `nitrite`, `iron`, `sulfate`, `turbidity`
*   `result` (Enum: 'layak', 'tidak_layak')
*   `analysis_notes` (Text)

---

## 🚀 Rencana Implementasi (Web-Focused Milestones)

Rencana ini dibagi menjadi 5 Milestone utama yang berfokus pada pembangunan antarmuka pengguna (UI), pengalaman pengguna (UX), dan integrasi sistem.

### Milestone 1: Foundation & Authentication (Visual Identity)
*   [x] **Setup Base Theme:** Konfigurasi sistem desain (warna premium PLN, tipografi, dan mode gelap/terang).
*   [x] **Shared Components:** Pembuatan komponen reusable seperti Buttons, Inputs, Cards, dan Modals.
*   [x] **Authentication Flow:** Implementasi halaman Login yang estetik dan sistem proteksi rute (Admin vs Operator) menggunakan Middleware.
*   [x] **Main Layout:** Pembangunan struktur navigasi (Sidebar/Navbar) yang responsif.

### Milestone 2: Operator Workflow (The Core UI)
*   [x] **Smart Input Form:** Pembangunan form input parameter air dengan validasi real-time dan pengalaman pengguna yang intuitif.
*   [x] **Classification Interface:** Desain halaman transisi (loading state) saat proses klasifikasi berjalan.
*   [x] **Result Presentation:** Implementasi halaman hasil klasifikasi dengan tipografi besar, animasi masuk (Framer Motion), dan ringkasan parameter.
*   [x] **Persistence Layer:** Integrasi API untuk menyimpan hasil ke database.

### Milestone 3: Analytical Dashboard (Data Visualization)
*   [x] **Summary Cards:** Implementasi kartu statistik interaktif pada dashboard utama.
*   [x] **Dynamic Charts:** Integrasi grafik tren (Line Chart) dan distribusi (Pie Chart) menggunakan data dari database.
*   [x] **Responsive Dashboard Layout:** Memastikan dashboard tampil sempurna di berbagai ukuran layar.

### Milestone 4: Reporting & Historical Data (Data Management)
*   [x] **Advanced Data Table:** Pembangunan tabel riwayat dengan fitur sorting, searching, dan pagination.
*   [x] **Filter System:** Implementasi filter berdasarkan rentang tanggal, unit, dan status kelayakan.
*   [x] **Export Integration:** Pengembangan fitur export data ke format PDF atau Excel langsung dari browser.

### Milestone 5: Admin Workspace & Final Polish (Control & UX)
*   [ ] **User Management UI:** Pembangunan dashboard kelola user (Tabel user, Form tambah/edit user).
*   [ ] **Model Performance UI:** Implementasi halaman visualisasi performa model (Confusion Matrix & Feature Importance charts).
*   [ ] **Micro-interactions:** Penambahan animasi halus, toast notifications, dan transisi halaman untuk kesan premium.
*   [ ] **Optimization:** Audit performa dan perbaikan UI bug.

