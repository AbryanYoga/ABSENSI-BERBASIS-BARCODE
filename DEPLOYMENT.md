# Production Deployment Guide - AttendScan

This guide details how to transition AttendScan from the local SQLite development environment to a production PostgreSQL database (such as **Supabase**, **Vercel Postgres / Neon**, or **AWS RDS**), and deploy the application to **Vercel**.

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Step 1: Provision a Production PostgreSQL Database](#step-1-provision-a-production-postgresql-database)
3. [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
4. [Step 3: Update Prisma Provider for PostgreSQL](#step-3-update-prisma-provider-for-postgresql)
5. [Step 4: Execute Production Migrations](#step-4-execute-production-migrations)
6. [Step 5: Seed Production Settings](#step-5-seed-production-settings)
7. [Step 6: Deploy to Vercel](#step-6-deploy-to-vercel)
8. [Step 7: Kiosk & Tablet Hardware Setup (Camera Permissions)](#step-7-kiosk--tablet-hardware-setup-camera-permissions)
9. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 1. Overview & Architecture

AttendScan is built with Next.js 16 (App Router), Prisma ORM v7, Tailwind CSS, and Shadcn UI.
- **Local Development**: Uses local SQLite (`dev.db`) via `@prisma/adapter-better-sqlite3`.
- **Production Environment**: Uses PostgreSQL via `@prisma/adapter-pg` with connection pooling.
- **Global Prisma Client** (`src/lib/prisma.ts`): Automatically detects whether `DATABASE_URL` is SQLite (`file:`) or PostgreSQL (`postgresql://`) and dynamically attaches the appropriate database driver adapter.

---

## 2. Step 1: Provision a Production PostgreSQL Database

You can provision a managed PostgreSQL database with any provider:

### Option A: Supabase (Recommended)
1. Log in to [Supabase](https://supabase.com/) and create a new project.
2. Navigate to **Project Settings > Database**.
3. Under **Connection string**, select **Node.js** (or **URI**) and copy the Connection String.
   - For serverless / Vercel deployments, use the **Transaction / Session Pooler** connection string (Port `6543` or `5432`).

### Option B: Vercel Postgres / Neon
1. In your Vercel project dashboard, navigate to the **Storage** tab and create a **Postgres** store.
2. Copy the `POSTGRES_PRISMA_URL` or `DATABASE_URL`.

---

## 3. Step 2: Configure Environment Variables

Update your local `.env` (or set these variables in the **Vercel Dashboard > Project Settings > Environment Variables**):

```bash
# Production PostgreSQL Connection String
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL for migrations (if using connection poolers like PgBouncer)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Production App URL
NEXT_PUBLIC_APP_URL="https://your-attendscan-app.vercel.app"
```

> [!IMPORTANT]
> Never commit `.env` or sensitive database passwords to version control. `.env` files are already included in `.gitignore`.

---

## 4. Step 3: Update Prisma Provider for PostgreSQL

In `prisma/schema.prisma`, update the `datasource db` block from `sqlite` to `postgresql`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

---

## 5. Step 4: Execute Production Migrations

Run Prisma migrations against the production database.

### Initial Migration Deployment
To apply existing migrations to production without prompting for interactive confirmations:

```bash
npx prisma migrate deploy
```

This command:
1. Connects to the database specified in `DATABASE_URL`.
2. Creates the Prisma migration tracking table if not present.
3. Executes all pending SQL migration files in `prisma/migrations/`.

### If Starting Fresh with PostgreSQL
If initializing a new PostgreSQL database schema from scratch:

```bash
# Generate the PostgreSQL migration
npx prisma migrate dev --name init_postgresql

# Or directly push the schema to the cloud DB
npx prisma db push
```

And re-generate the Prisma Client:

```bash
npx prisma generate
```

---

## 6. Step 5: Seed Production Settings

Initialize the default system settings (`jam_masuk_normal: "08:00:00"`) in production:

```bash
npx prisma db seed
```

This executes `prisma/seed.ts`, ensuring default operating hours and initial tables are established.

---

## 7. Step 6: Deploy to Vercel

### 1. Import Repository
1. Push all code to your GitHub repository: `https://github.com/AbryanYoga/ABSENSI-BERBASIS-BARCODE`.
2. In [Vercel](https://vercel.com/), click **Add New > Project** and import the repository.

### 2. Configure Build & Install Commands
- **Framework Preset**: `Next.js`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

### 3. Add Environment Variables
Add the following in Vercel:
- `DATABASE_URL`: Your production PostgreSQL connection string.
- `NEXT_PUBLIC_APP_URL`: Your deployed Vercel domain URL.

### 4. Optional Vercel Build Optimization Script
In `package.json`, you can optionally set `vercel-build` to ensure Prisma client is generated before the Next.js build:

```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "next build"
}
```

---

## 8. Step 7: Kiosk & Tablet Hardware Setup (Camera Permissions)

Kiosks mounted at turnstiles typically run on tablets (iPadOS Safari or Android Chrome in kiosk lock mode).

### Critical Requirements for Kiosk Cameras:
1. **HTTPS is Mandatory**: Modern mobile browsers (iOS Safari, Android Chrome) strictly block access to `navigator.mediaDevices.getUserMedia` over unencrypted HTTP (except on `localhost`). Production deployments **must** run on HTTPS.
2. **Camera Permissions Trigger**: If the browser displays a permission prompt, tap **Allow**. The app includes a fallback button (`Start Camera Feed`) allowing the user to initiate camera access via a direct user interaction.
3. **PWA / Fullscreen Mode**:
   - On **iPad**: Open Safari, navigate to `/scanner`, tap the **Share** button, and select **Add to Home Screen**. When opened, it runs in fullscreen kiosk mode without browser address bars.
   - On **Android**: Open Chrome, tap the menu, and select **Install app** or **Add to Home screen**.

---

## 9. Troubleshooting & FAQ

### Q: "Cannot find module '@prisma/adapter-pg'"
Ensure production dependencies include `@prisma/adapter-pg` and `pg`:
```bash
npm install @prisma/adapter-pg pg
```

### Q: "Connection timeout on Vercel serverless functions"
Use a connection pooler (like Supabase PgBouncer or Neon connection pooler) with `?pgbouncer=true` and `connection_limit=1`.

### Q: "Camera shows black screen on iOS Safari"
1. Verify the tablet is connected over `https://`.
2. Go to **iPad Settings > Safari > Camera** and ensure permission is set to **Ask** or **Allow**.
3. Use the **Simulate Kiosk Scan** panel on the right side if operating in demo/headless mode.
