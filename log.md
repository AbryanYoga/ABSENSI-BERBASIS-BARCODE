# Project Development Log - AttendScan (Absensi Berbasis Barcode/QR)

## [2026-09-20 14:38:04 +07:00] - Phase 1: Project Initialization

### Summary of Prompt:
- Configure Git identity to `Abryan Yoga Pratama` (`admin@local.dev`).
- Establish `log.md` development tracking mechanism before writing any code.
- Analyze Stitch AI UI mockups in `Assets/UI/` to replicate the design architecture, colors, spacing, and component structure.
- Bootstrap a Next.js web application with App Router, TypeScript, and Tailwind CSS.
- Install core dependencies: `prisma`, `@prisma/client`, `lucide-react`, `react-qr-code`, `html5-qrcode`, `date-fns`.
- Initialize Shadcn UI and install base components (`button`, `sheet`, `alert-dialog`, `badge`, `table`, `dialog`, `input`, `label`).
- Configure global styling and design tokens adhering to reference mockups (clean corporate design, slate-50 background, corporate primary color, slate-200 borders).
- Stage, commit, and push Phase 1 work to repository.

### Planned Actions:
1. Confirm Git user config (`user.name` and `user.email`).
2. Create root `log.md` logging Phase 1 initialization details.
3. Review and analyze all 5 mockups in `Assets/UI/`:
   - `UI DASHBOARD.png`: Overview dashboard, live punch stream, telemetry, and quick scan kiosk action.
   - `UI Absen.png`: Live camera QR/barcode scanner terminal kiosk interface.
   - `UI ATTEDANCE.png`: Attendance logs table with status pills, filters, search, and pagination.
   - `UI BARCODE.png`: Employee credential modal with QR code, barcode, and badge preview.
   - `UI EMPLOYEE.png`: Employee management table, action buttons, filter/export, status badges.
4. Bootstrap Next.js project directly into current directory with TypeScript and Tailwind CSS.
5. Install requested project dependencies:
   - `prisma` and `@prisma/client`
   - `lucide-react`
   - `react-qr-code` and `html5-qrcode`
   - `date-fns`
   - `clsx`, `tailwind-merge`, and required Radix primitives for Shadcn UI components.
6. Initialize Shadcn UI configuration (`components.json`) and install required UI components:
   - `button`
   - `sheet`
   - `alert-dialog`
   - `badge`
   - `table`
   - `dialog`
   - `input`
   - `label`
7. Configure `app/globals.css` and `tailwind.config.ts` with corporate color palette and design tokens extracted from mockups (slate-50 background, slate-200 borders, crisp corporate primary palette, rounded corners, clean typography).
8. Verify build and Next.js setup with `npm run build` or dev check.
9. Stage all changes (`git add .`), commit with descriptive message, and push (`git push`).

### Completed Actions & Outcome:
- **Git Identity Configured**: Set `user.name` to `Abryan Yoga Pratama` and `user.email` to `admin@local.dev`.
- **UI Analysis**: Examined all Stitch AI mockup assets in `Assets/UI/` (`UI DASHBOARD.png`, `UI Absen.png`, `UI ATTEDANCE.png`, `UI BARCODE.png`, `UI EMPLOYEE.png`). Extracted flat corporate design parameters (slate-50 background, corporate primary accents, slate-200 borders, card layouts, status badges).
- **Next.js Project Initialized**: Next.js 16 with App Router, TypeScript, and Tailwind CSS v4.
- **Dependencies Installed**:
  - Prisma ORM (`prisma`, `@prisma/client`) initialized with schema and `.env`.
  - UI Icons: `lucide-react`.
  - QR Tools: `react-qr-code`, `html5-qrcode`.
  - Date Manipulation: `date-fns`.
- **Shadcn UI Setup**: Initialized with modern Radix/Base-UI primitives and installed base components:
  - `button`, `sheet`, `alert-dialog`, `badge`, `table`, `dialog`, `input`, `label`.
- **Global CSS & Theme**: Configured `globals.css` with corporate tokens (slate-50 background, slate-200 borders, blue-600 / brand-teal corporate accents).
- **Production Build Verification**: Ran `npm run build` with Turbopack, compiling successfully with 0 errors.
- **Ready for Commit & Push**: Staging all initialized project files.

## [2026-09-20 17:13:55 +07:00] - Phase 2: Database Architecture

### Summary of Prompt:
- Configure Prisma for SQLite (for quick development and zero-config local run) while keeping architecture cleanly switchable to PostgreSQL.
- Define Prisma Schema with models:
  - `Karyawan`: `id` (String/UUID, default uuid), `nama_lengkap` (String), `jabatan` (String), `qr_code_id` (String, unique).
  - `Pengaturan`: `id` (Int, default 1), `jam_masuk_normal` (String, default "08:00:00").
  - `Absensi`: `id` (String/UUID, default uuid), `karyawan_id` (relation to `Karyawan`), `tanggal` (DateTime), `waktu_masuk` (DateTime, nullable), `waktu_pulang` (DateTime, nullable), `status_masuk` (String: "Tepat Waktu", "Terlambat", "Alpha").
  - Compound unique constraint on `[karyawan_id, tanggal]` in `Absensi`.
- Format schema, generate Prisma Client, and run the initial migration.
- Create global Prisma client singleton in `lib/prisma.ts` (and `src/lib/prisma.ts` for consistency).
- Create database seed script (`prisma/seed.ts`) to insert default `Pengaturan` record (`jam_masuk_normal: "08:00"`).
- Verify migrations, seed execution, and schema integrity.
- Update `log.md`, commit as `Abryan Yoga Pratama <admin@local.dev>`, and push.

### Planned Actions:
1. Update `prisma/schema.prisma` with SQLite provider (`url = env("DATABASE_URL")` / `file:./dev.db`), and models `Karyawan`, `Pengaturan`, `Absensi` with compound unique index `@@unique([karyawan_id, tanggal])`.
2. Configure `DATABASE_URL` in `.env` and `prisma7.config.ts` / `prisma.config.ts` to point to `file:./dev.db`.
3. Format schema with `npx prisma format`.
4. Run migration with `npx prisma migrate dev --name init`.
5. Generate Prisma Client with `npx prisma generate`.
6. Implement singleton Prisma client in `src/lib/prisma.ts` and `lib/prisma.ts` (handling Next.js hot reload / globalThis pattern).
7. Create seed script `prisma/seed.ts` and configure `"prisma": { "seed": "tsx prisma/seed.ts" }` (or node runner) in `package.json`. Run `npx prisma db seed`.
8. Update `log.md` with completed actions and outputs.
9. Commit all changes and push to remote repository as `Abryan Yoga Pratama`.

### Completed Actions & Outcome:
- **Schema Design (`prisma/schema.prisma`)**:
  - Configured `sqlite` provider for lightweight setup, easily switchable to `postgresql`.
  - Added model `Karyawan` with UUID `id`, `nama_lengkap`, `jabatan`, and unique `qr_code_id`.
  - Added model `Pengaturan` with Int `id` (default 1) and `jam_masuk_normal` (default "08:00:00").
  - Added model `Absensi` with UUID `id`, `karyawan_id` foreign key relation to `Karyawan`, `tanggal` (date), nullable `waktu_masuk` and `waktu_pulang`, and `status_masuk`.
  - Created compound unique index `@@unique([karyawan_id, tanggal])` on `Absensi` to enforce one attendance record per employee per day.
- **Prisma Tooling & Migration**:
  - Formatted schema with `npx prisma format`.
  - Created and applied migration `20260920101847_init` via `npx prisma migrate dev --name init`.
  - Generated type-safe client with `npx prisma generate` to `src/generated/prisma`.
- **Global Prisma Client Singleton**:
  - Implemented `src/lib/prisma.ts` and `lib/prisma.ts` using `@prisma/adapter-better-sqlite3` and `@prisma/adapter-pg`.
  - Client automatically detects connection string and switches between SQLite (`file:`) and PostgreSQL (`postgresql:`) seamlessly.
- **Database Seeding**:
  - Created `prisma/seed.ts` inserting default `Pengaturan` row (`id: 1`, `jam_masuk_normal: "08:00"`).
  - Configured `seed` in `prisma7.config.ts` and `package.json`.
  - Ran `npx prisma db seed` with successful verification.
- **Verification**:
  - Executed queries against local database successfully.
  - Verified `npm run build` compiles with 0 errors.
- **Ready for Commit & Push**: Staged all changes and prepared commit under human developer identity.

## [2026-09-20 17:24:35 +07:00] - Phase 3: Admin Layout & Navigation

### Summary of Prompt:
- Read and analyze the Admin Layout PNG mockups in `Assets/UI/` (`UI DASHBOARD.png`, `UI ATTEDANCE.png`, `UI EMPLOYEE.png`).
- Build the Admin Layout (`app/(admin)/layout.tsx` / `src/app/(admin)/layout.tsx`) following strict flat design architecture (no nested cards, relying on clean whitespace, subtle borders).
- Build the Collapsible Sidebar Component (`components/Sidebar.tsx` / `src/components/Sidebar.tsx`) matching the mockup:
  - Toggle button for expanded/collapsed states (collapse toggle icon at top right of sidebar or bottom).
  - Brand header: "AttendScan Enterprise Core" with stylized green logo icon.
  - Category header: "OPERATIONS" / "WORKSPACE".
  - Menu navigation items:
    - Dashboard (`/admin`)
    - Employees (`/admin/karyawan`)
    - Attendance (`/admin/absensi`)
    - System Settings (`/admin/settings`)
  - Bottom action: "Switch to Kiosk" / user profile quick toggle.
- Build the Top Navbar (`components/Navbar.tsx` / `src/components/Navbar.tsx`) containing:
  - Breadcrumb navigation: e.g. "Administration > Live Monitor" or "Enterprise Core > Operations Desk".
  - Status indicator: "System Online • 99.9% Sync" with live pulse dot.
  - Quick Search bar with shortcut indicator (`⌘K` / `Ctrl+K`).
  - Notification icon with badge indicator.
  - Admin Profile dropdown/card (Eleanor Vance - Chief of HR Operations / Admin avatar).
- Update `log.md`, stage, commit as `Abryan Yoga Pratama <admin@local.dev>`, and push.

### Planned Actions:
1. Re-examine the 3 admin mockups (`UI DASHBOARD.png`, `UI ATTEDANCE.png`, `UI EMPLOYEE.png`) with special focus on Sidebar details, Top Navbar structure, breadcrumbs, search input, and profile header.
2. Build `src/components/Sidebar.tsx` (and `components/Sidebar.tsx` alias) with collapsible state, smooth transition, active route highlight with brand-teal `#006b5f` active pill/background, icons from `lucide-react`, and footer kiosk switcher.
3. Build `src/components/Navbar.tsx` (and `components/Navbar.tsx`) with dynamic breadcrumb / page title, sync badge, search bar, notification button, and profile trigger.
4. Implement `src/app/(admin)/layout.tsx` integrating the collapsible Sidebar and Top Navbar, wrapping children in a clean flat container on `bg-slate-50`.
5. Create initial placeholder admin pages for `/admin` (`page.tsx`), `/admin/karyawan` (`page.tsx`), and `/admin/absensi` (`page.tsx`) so navigation routes render seamlessly.
6. Verify layout and responsive / collapsed interactions, run `npm run build` to ensure type-safety.
7. Update `log.md`, commit, and push.

### Completed Actions & Outcome:
- **Mockup Analysis**: Re-analyzed `UI DASHBOARD.png`, `UI ATTEDANCE.png`, and `UI EMPLOYEE.png`. Mapped exact visual components:
  - Sidebar: AttendScan brand icon, `PanelLeftClose`/`PanelLeftOpen` toggle, navigation pill styling (`#006b5f`), "Switch to Kiosk" action, and HR profile info.
  - Navbar: Breadcrumbs, live status indicator (`System Online • 99.9% Sync`), quick search input with `⌘K` badge, notification bell with alert dot, and Eleanor Vance profile card.
  - Strict Flat Architecture: Slate-50 background, slate-200 1px borders, subtle padding and whitespace, eliminating unnecessary nested card containers.
- **Collapsible Sidebar (`src/components/Sidebar.tsx` & `components/Sidebar.tsx`)**:
  - Implemented responsive collapsible state toggle.
  - Configured navigation routes: Dashboard (`/admin`), Employees (`/admin/karyawan`), Attendance (`/admin/absensi`), and Settings (`/admin/settings`).
  - Active links styled with deep emerald-teal background and white icons.
  - Added bottom Kiosk shortcut button and operator profile.
- **Top Navbar (`src/components/Navbar.tsx` & `components/Navbar.tsx`)**:
  - Built breadcrumb reflecting active page section and subtitle.
  - Added real-time operational status pill with pulse indicator.
  - Added search bar, notification action, and user profile card.
- **Admin Layout (`src/app/(admin)/layout.tsx`)**:
  - Structured full-height dual-pane layout with sticky sidebar and fluid main content viewport.
- **Route Views Initialized**:
  - Created `/admin` (Dashboard telemetry & overview cards).
  - Created `/admin/karyawan` (Employees directory structure).
  - Created `/admin/absensi` (Attendance logs view).
- **Verification**:
  - Production build compiled successfully (`npm run build`) generating static routes with 0 errors.
- **Ready for Commit & Push**: Staged all changes and prepared commit under human developer identity.
