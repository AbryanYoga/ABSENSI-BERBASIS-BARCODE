# Sistem Absensi Karyawan Berbasis QR Code (AttendScan)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM 7](https://img.shields.io/badge/Prisma-7.10-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Sistem Absensi Karyawan Berbasis QR Code** (**AttendScan**) adalah aplikasi web modern dan efisien yang dirancang khusus untuk mengelola presensi karyawan serta kontrol akses gerbang/turnstile kantor secara otomatis. Aplikasi ini menggabungkan antarmuka **Admin Dashboard** berarsitektur *flat-design* yang intuitif dan terminal **Kiosk Scanner** berbasis webcam secara *real-time*.

---

## 📌 Fitur Utama (Key Features)

1. **Manajemen Karyawan (CRUD Employees)**
   - Tambah, ubah, dan hapus profil data karyawan secara mudah dan cepat.
   - Panel samping interaktif (*slide-over sheet*) untuk formulir input yang rapi tanpa berpindah halaman.
   - Dialog konfirmasi aman untuk penghapusan data guna mencegah hilangnya data secara tidak sengaja.

2. **Pembuatan Kode QR Otomatis (Auto QR Code Generation)**
   - Setiap karyawan baru secara otomatis menerima token identifikasi unik dan kode QR tersendiri.
   - Modal pratinjau kartu tanda pengenal (*Employee Credential Badge*) dengan kode QR dan simulasi barcode standar.
   - Fitur cetak langsung (*Print to Printer / PDF*) dengan tata letak cetak (*print stylesheet*) yang rapi dan terisolasi.

3. **Terminal Kiosk Scanner Real-Time (Webcam Kiosk)**
   - Pemindaian kode QR instan menggunakan kamera perangkat atau webcam eksternal via pustaka `html5-qrcode`.
   - Bidik optik interaktif (*optical HUD reticle*) dilengkapi garis pandu laser hijau bergerak (*animated laser scan line*).
   - Jam digital presisi tinggi tersinkronisasi waktu (*NTP-synchronized digital clock*).
   - Tombol pengalih kamera depan/belakang (*Front / Rear Camera Toggle*) yang dioptimalkan untuk perangkat tablet/iPad pada turnstile gerbang masuk.
   - Panel simulasi pemindaian (*Simulate Kiosk Scan*) untuk keperluan demonstrasi atau pengujian tanpa perlu mencetak kartu fisik.

4. **Laporan & Rekap Absensi (Attendance Reports & Logic)**
   - **Logika Otomatis Masuk & Pulang**:
     - **Presensi Masuk (Check-In)**: Membandingkan waktu ketukan kartu dengan jam masuk normal kantor (`08:00:00`). Sistem secara otomatis memberi label **Tepat Waktu** (*On Time*) atau **Terlambat** (*Late*) lengkap dengan kalkulasi menit keterlambatannya.
     - **Presensi Pulang (Check-Out)**: Secara otomatis mencatat waktu kepulangan pada pemindaian kedua di hari yang sama.
     - **Pencegahan Duplikasi**: Menolak ketukan ganda jika presensi masuk dan pulang pada hari tersebut telah tercatat lengkap, dilengkapi mekanisme *debounce* anti-pemindaian berulang.
   - **Filter Cepat Berdasarkan Tanggal**: Preset satu klik (*Hari Ini*, *Kemarin*, *7 Hari Terakhir*, *Bulan Ini*) serta pemilih tanggal kalender kustom.
   - **Pencarian & Filter Departemen**: Filter data berdasarkan divisi/jabatan serta pencarian instan nama atau ID karyawan.
   - **Ekspor Data**: Fitur ekspor data presensi ke format CSV dan pencetakan laporan harian.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

| Komponen | Teknologi |
| :--- | :--- |
| **Framework Utama** | [Next.js 16](https://nextjs.org/) (App Router, React Server Actions, Turbopack) |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) |
| **Desain & Styling** | [Tailwind CSS v4](https://tailwindcss.com/) dengan palet token korporat modern |
| **Komponen UI** | [Shadcn UI](https://ui.shadcn.com/) (berbasis Radix & Base-UI primitives) & [Lucide Icons](https://lucide.dev/) |
| **Database & ORM** | [Prisma ORM 7](https://www.prisma.io/) (PostgreSQL di produksi, SQLite untuk pengujian lokal) |
| **Pemindaian & Barcode** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) & [react-qr-code](https://github.com/rosskhanas/react-qr-code) |
| **Utilitas Waktu** | [date-fns](https://date-fns.org/) |

---

## 💻 Prasyarat & Instalasi (How to Install)

Pastikan di komputer Anda telah terpasang **Node.js** (versi 18.18.0 atau lebih baru) dan **npm** / **pnpm**.

### 1. Kloning Repositori
```bash
git clone https://github.com/AbryanYoga/ABSENSI-BERBASIS-BARCODE.git
cd ABSENSI-BERBASIS-BARCODE
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi File Lingkungan (`.env`)
Salin atau buat file `.env` di direktori utama (*root directory*):

```env
# Untuk Pengembangan Lokal (SQLite):
DATABASE_URL="file:./dev.db"

# Untuk Lingkungan Produksi (PostgreSQL - contoh Supabase / Vercel Postgres):
# DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
# DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# URL Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Sinkronisasi Skema Database & Migrasi
Jalankan salah satu perintah berikut untuk menyiapkan tabel database:

```bash
# Untuk sinkronisasi langsung skema ke database:
npx prisma db push

# ATAU jalankan migrasi lokal:
npx prisma migrate dev --name init
```

Inisialisasi pengaturan awal sistem (jam masuk kerja normal `08:00:00`):
```bash
npx prisma db seed
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```

Buka peramban (*browser*) Anda dan akses aplikasi di:
- **Halaman Utama / Dashboard Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Halaman Terminal Kiosk Scanner:** [http://localhost:3000/scanner](http://localhost:3000/scanner)

---

## 📖 Panduan Penggunaan (Usage Guide)

### 1. Alur Administrator (Admin Portal)
- **Kelola Karyawan (`/admin/karyawan`)**:
  - Klik tombol **"+ Add Employee"** untuk menambahkan data anggota tim baru (Nama Lengkap dan Jabatan/Departemen). Sistem akan langsung menghasilkan ID unik dan kode QR.
  - Klik ikon **QR Code** pada baris karyawan untuk melihat kartu identitas digital dan mencetak kartu fisik dengan tombol **"Print Badge"**.
  - Ubah informasi karyawan atau hapus karyawan jika sudah tidak aktif.
- **Lihat Rekap Presensi (`/admin/absensi`)**:
  - Pantau rekap kehadiran harian karyawan secara komprehensif.
  - Gunakan filter status (*All*, *On Time*, *Late*, *Not Checked Out*) atau saring berdasarkan rentang tanggal tertentu.
  - Ekspor log data presensi ke file CSV melalui tombol **"Export CSV"**.

### 2. Alur Kiosk Presensi (Kiosk Terminal)
- **Pemindaian Masuk & Pulang (`/scanner` atau `/kiosk`)**:
  - Buka alamat `/scanner` pada perangkat yang diletakkan di pintu masuk atau turnstile kantor (misal: tablet, iPad, atau komputer pos sekuriti dengan webcam).
  - Pastikan izin akses kamera (*Camera Permission*) telah diberikan. Jika menggunakan tablet, gunakan tombol alih kamera untuk memilih kamera depan atau belakang.
  - Karyawan mengarahkan kode QR kartu mereka ke dalam kotak bidik optik hijau (*viewfinder*).
  - Sistem akan langsung memverifikasi ID:
    - Menampilkan notifikasi kartu karyawan yang terverifikasi (foto, nama, divisi, serta status kepatuhan waktu).
    - Membuka simulasi akses gerbang (*Turnstile Unlocked - Access Granted*).
    - Membunyikan nada konfirmasi keberhasilan pemindaian.

---

## 🎨 Referensi Desain Antarmuka (UI Design Reference)

Arsitektur antarmuka dan estetika visual aplikasi ini dirancang secara presisi mengacu pada berkas mockup **`image_f938d5.png`** (beserta mockup pelengkap `UI DASHBOARD.png`, `UI Absen.png`, `UI ATTEDANCE.png`, `UI BARCODE.png`, dan `UI EMPLOYEE.png`) yang terdapat pada direktori:
```
Assets/UI/
```

**Prinsip Desain yang Diterapkan:**
- **Arsitektur Flat Design**: Mengeliminasi kartu berlapis (*nested cards*) yang berat, mengutamakan ruang putih (*whitespace*) dan batas garis halus (*border slate-200*).
- **Palet Warna Korporat**: Latar belakang bersih `slate-50`, aksen korporat `teal-700` (`#006b5f`), status tepat waktu `emerald-500`, dan status keterlambatan `rose-500`.
- **Tipografi Modern**: Font sans-serif yang bersih dipadukan dengan tipografi *monospace* untuk indikator jam, kode RFID, dan telemetri terminal.

---

## 🚀 Panduan Deployment Produksi

Untuk panduan lengkap mengenai cara menghubungkan database PostgreSQL di cloud (Supabase, Neon, Vercel Postgres), menjalankan perintah `npx prisma migrate deploy`, dan memasang aplikasi di Vercel, silakan baca dokumentasi terpisah pada berkas **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## 👨‍💻 Pengembang & Lisensi

- **Lead Developer**: Abryan Yoga Pratama (`admin@local.dev`)
- **Lisensi**: [MIT License](LICENSE)
