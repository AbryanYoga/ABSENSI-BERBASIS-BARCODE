-- CreateTable
CREATE TABLE "karyawan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama_lengkap" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pengaturan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "jam_masuk_normal" TEXT NOT NULL DEFAULT '08:00:00',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "karyawan_id" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "waktu_masuk" DATETIME,
    "waktu_pulang" DATETIME,
    "status_masuk" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "absensi_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_qr_code_id_key" ON "karyawan"("qr_code_id");

-- CreateIndex
CREATE INDEX "absensi_tanggal_idx" ON "absensi"("tanggal");

-- CreateIndex
CREATE INDEX "absensi_karyawan_id_idx" ON "absensi"("karyawan_id");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_karyawan_id_tanggal_key" ON "absensi"("karyawan_id", "tanggal");
