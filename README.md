# AttendScan - Enterprise Attendance & Access Management System

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM 7](https://img.shields.io/badge/Prisma-7.10-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**AttendScan** is a mission-critical, enterprise-grade Employee Attendance and Turnstile Access Control web application. Designed around clean, flat corporate UI aesthetics with zero visual clutter, AttendScan provides automated optical QR and barcode check-in/out, live attendance telemetry, complete employee directory management, and comprehensive attendance audit logs.

---

## Key Features

### 1. Optical Kiosk Scanner (`/scanner` & `/kiosk`)
- **Real-Time Optical Reticle**: Integrated with `html5-qrcode` featuring animated laser targeting reticles, HUD telemetry overlay, and dual-camera switching (front/rear) tailored for mounted tablet kiosks (iPadOS Safari & Android Chrome).
- **NTP-Synchronized Clock**: Precision digital terminal clock displaying exact hours, minutes, seconds, and date.
- **Intelligent Check-In / Check-Out Logic**:
  - **Scenario A (Check-In)**: Compares arrival time against configured office start time (`Pengaturan.jam_masuk_normal`, default `08:00`) and tags attendance as either **Tepat Waktu** (On Time) or **Terlambat** (Late with calculated deviation duration).
  - **Scenario B (Check-Out)**: Automatically registers departure time (`waktu_pulang`) on second scan of the day.
  - **Scenario C (Duplicate Protection)**: Prevents redundant punches if both check-in and check-out are already recorded, complete with anti-rebound scan debouncing.
- **Visual & Audio Feedback**: Displays real-time employee profile cards, turnstile unlock banners (`Turnstile A-01 Unlocked • Access Granted • 15s`), and synthesized audio chimes.
- **One-Click Simulator Panel**: Embedded controls to test on-time arrival, late entry, shift checkout, and invalid QR scenarios without needing physical badges.

### 2. Executive Admin Dashboard (`/admin`)
- **Key Metrics Telemetry**: Real-time KPI summary cards displaying Total Staff, Present Today, Late Arrivals, and System Status.
- **Quick Kiosk Launcher**: Direct button to switch the terminal into dedicated full-screen scanning mode.
- **Live Activity Stream**: Real-time audit log of the most recent employee turnstile punches with timestamps and punctuality status pills.

### 3. Employee Management Directory (`/admin/karyawan`)
- **Flat Corporate Data Table**: Clean, high-density listing of personnel with ID, Full Name, Role/Department, and Action triggers.
- **Slide-Over Management Sheet**: Right-side drawer for creating and updating employee profiles with instant UUID and secure QR token generation.
- **Employee Credential & QR Modal**: High-contrast printable badge dialog with `react-qr-code`, simulated 1D barcode preview, and clean `window.print()` print styles.
- **Secure Deletion**: Confirmation dialog with dependency protection for clean database operations.

### 4. Attendance Logs & Auditing (`/admin/absensi`)
- **Date Range Presets**: Filter records effortlessly with single-click presets (*Today*, *Yesterday*, *Last 7 Days*, *This Month*) or custom calendar date selection.
- **Department & Search Filtering**: Instant client/server filtering across departments and employee names.
- **Precision Status Badges**:
  - `Tepat Waktu` (Emerald): On-time arrival.
  - `Terlambat` (Rose): Late arrival with exact delay minutes calculation.
  - `Shift In Progress` (Slate): Checked in, awaiting end-of-shift checkout.
  - `Alpha` (Amber): Absent records.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack & React Server Actions |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with flat corporate color tokens (`slate-50`, `teal-700`, `slate-200`) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) with Radix / Base-UI primitives & [Lucide Icons](https://lucide.dev/) |
| **Database & ORM** | [Prisma ORM 7](https://www.prisma.io/) with dual driver adapters (`@prisma/adapter-better-sqlite3` & `@prisma/adapter-pg`) |
| **Optical Scanning** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) & [react-qr-code](https://github.com/rosskhanas/react-qr-code) |
| **Utilities** | [date-fns](https://date-fns.org/), `clsx`, `tailwind-merge` |

---

## Database Architecture

The schema (`prisma/schema.prisma`) enforces strict relational integrity and daily attendance constraints:

```prisma
model Karyawan {
  id           String    @id @default(uuid())
  nama_lengkap String
  jabatan      String
  qr_code_id   String    @unique
  absensi      Absensi[]
}

model Pengaturan {
  id               Int    @id @default(1)
  jam_masuk_normal String @default("08:00:00")
}

model Absensi {
  id           String    @id @default(uuid())
  karyawan_id  String
  tanggal      DateTime
  waktu_masuk  DateTime?
  waktu_pulang DateTime?
  status_masuk String

  karyawan     Karyawan  @relation(fields: [karyawan_id], references: [id], onDelete: Cascade)

  @@unique([karyawan_id, tanggal])
}
```

---

## Getting Started (Local Development)

### 1. Prerequisites
- **Node.js**: v18.18.0 or newer
- **npm** or **pnpm**

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/AbryanYoga/ABSENSI-BERBASIS-BARCODE.git
cd ABSENSI-BERBASIS-BARCODE

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Local Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production PostgreSQL (Supabase / Vercel Postgres / Neon)
# DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
```

### 4. Initialize Database & Seed
```bash
# Apply migrations to local SQLite
npx prisma migrate dev --name init

# Seed default settings (jam_masuk_normal = "08:00")
npx prisma db seed
```

### 5. Launch the Application
```bash
npm run dev
```

Visit the following routes in your browser:
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Employee Directory**: [http://localhost:3000/admin/karyawan](http://localhost:3000/admin/karyawan)
- **Attendance Logs**: [http://localhost:3000/admin/absensi](http://localhost:3000/admin/absensi)
- **Kiosk Optical Scanner**: [http://localhost:3000/scanner](http://localhost:3000/scanner)

---

## Production Deployment

For complete, step-by-step instructions on provisioning a production PostgreSQL database (Supabase, Vercel Postgres, Neon) and deploying to Vercel, please read the **[Production Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)**.

### Quick Production Commands:
```bash
# 1. Update datasource in prisma/schema.prisma provider to "postgresql"
# 2. Deploy migrations to production database
npx prisma migrate deploy

# 3. Seed production settings
npx prisma db seed

# 4. Build and verify
npm run build
```

---

## Tablet & Kiosk Hardware Setup

When mounting tablets (iPadOS or Android tablets) at physical office turnstiles:
1. **HTTPS Required**: Modern mobile browsers require HTTPS to access camera hardware. Deploy to Vercel or configure SSL.
2. **Add to Home Screen (PWA Mode)**:
   - On **iPad**: Open Safari, navigate to `/scanner`, tap the Share button, and choose **Add to Home Screen** to launch in frameless kiosk mode.
   - On **Android**: Open Chrome, tap the menu, and choose **Install app** or **Add to Home screen**.
3. **Camera Switching**: Use the built-in camera toggle button on the optical viewfinder to toggle between the front and rear camera depending on the tablet mount orientation.

---

## Authors & Acknowledgments

- **Lead Developer**: Abryan Yoga Pratama (`admin@local.dev`)
- **UI Architecture**: Flat Corporate Design System derived from Stitch AI specifications.
