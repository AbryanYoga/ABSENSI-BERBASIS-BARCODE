import { prisma } from "@/lib/prisma";
import { recordAttendancePunch } from "@/actions/absensi";
import { POST } from "@/app/api/attendance/route";
import { NextRequest } from "next/server";

describe("Attendance System Core Logic & Server Actions Validation", () => {
  const testOnTimeEmpQr = "QR-TEST-ONTIME-01";
  const testLateEmpQr = "QR-TEST-LATE-02";
  const testCheckoutEmpQr = "QR-TEST-CHECKOUT-03";
  const testDuplicateEmpQr = "QR-TEST-DUP-04";
  const invalidQrCode = "QR-NON-EXISTENT-9999";

  let onTimeEmpId: string;
  let lateEmpId: string;
  let checkoutEmpId: string;
  let duplicateEmpId: string;

  beforeAll(async () => {
    // 1. Ensure Pengaturan exists with normal check-in at 08:00:00
    await prisma.pengaturan.upsert({
      where: { id: 1 },
      update: { jam_masuk_normal: "08:00:00" },
      create: { id: 1, jam_masuk_normal: "08:00:00" },
    });

    // 2. Create test employees
    const emp1 = await prisma.karyawan.upsert({
      where: { qr_code_id: testOnTimeEmpQr },
      update: { nama_lengkap: "Test Emp OnTime", jabatan: "Engineering" },
      create: {
        nama_lengkap: "Test Emp OnTime",
        jabatan: "Engineering",
        qr_code_id: testOnTimeEmpQr,
      },
    });
    onTimeEmpId = emp1.id;

    const emp2 = await prisma.karyawan.upsert({
      where: { qr_code_id: testLateEmpQr },
      update: { nama_lengkap: "Test Emp Late", jabatan: "Product" },
      create: {
        nama_lengkap: "Test Emp Late",
        jabatan: "Product",
        qr_code_id: testLateEmpQr,
      },
    });
    lateEmpId = emp2.id;

    const emp3 = await prisma.karyawan.upsert({
      where: { qr_code_id: testCheckoutEmpQr },
      update: { nama_lengkap: "Test Emp Checkout", jabatan: "Operations" },
      create: {
        nama_lengkap: "Test Emp Checkout",
        jabatan: "Operations",
        qr_code_id: testCheckoutEmpQr,
      },
    });
    checkoutEmpId = emp3.id;

    const emp4 = await prisma.karyawan.upsert({
      where: { qr_code_id: testDuplicateEmpQr },
      update: { nama_lengkap: "Test Emp Duplicate", jabatan: "Finance" },
      create: {
        nama_lengkap: "Test Emp Duplicate",
        jabatan: "Finance",
        qr_code_id: testDuplicateEmpQr,
      },
    });
    duplicateEmpId = emp4.id;

    // Clean up any pre-existing test attendance rows
    await prisma.absensi.deleteMany({
      where: {
        karyawan_id: { in: [onTimeEmpId, lateEmpId, checkoutEmpId, duplicateEmpId] },
      },
    });
  });

  afterAll(async () => {
    // Clean up all created test data
    await prisma.absensi.deleteMany({
      where: {
        karyawan_id: { in: [onTimeEmpId, lateEmpId, checkoutEmpId, duplicateEmpId] },
      },
    });

    await prisma.karyawan.deleteMany({
      where: {
        id: { in: [onTimeEmpId, lateEmpId, checkoutEmpId, duplicateEmpId] },
      },
    });
  });

  // =========================================================================
  // SCENARIO 1: Valid Check-In, On Time (Scan BEFORE jam_masuk_normal)
  // =========================================================================
  test("Scenario 1: Valid Check-In On Time creates record with status 'Tepat Waktu'", async () => {
    // Simulate scan at 07:45 AM (before 08:00 AM)
    const scanTime = new Date();
    scanTime.setHours(7, 45, 0, 0);

    const result = await recordAttendancePunch(testOnTimeEmpQr, {
      customTime: scanTime.toISOString(),
    });

    expect(result.success).toBe(true);
    expect(result.scenario).toBe("CHECK_IN");
    expect(result.status).toBe("Tepat Waktu");
    expect(result.karyawan?.id).toBe(onTimeEmpId);

    // Verify database record
    const today = new Date(scanTime);
    today.setHours(0, 0, 0, 0);

    const dbRecord = await prisma.absensi.findUnique({
      where: {
        karyawan_id_tanggal: {
          karyawan_id: onTimeEmpId,
          tanggal: today,
        },
      },
    });

    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.status_masuk).toBe("Tepat Waktu");
    expect(dbRecord?.waktu_masuk).not.toBeNull();
    expect(dbRecord?.waktu_pulang).toBeNull();
  });

  // =========================================================================
  // SCENARIO 2: Valid Check-In, Late (Scan AFTER jam_masuk_normal)
  // =========================================================================
  test("Scenario 2: Valid Check-In Late creates record with status 'Terlambat'", async () => {
    // Simulate scan at 08:35 AM (35 minutes after 08:00 AM)
    const scanTime = new Date();
    scanTime.setHours(8, 35, 0, 0);

    const result = await recordAttendancePunch(testLateEmpQr, {
      customTime: scanTime.toISOString(),
    });

    expect(result.success).toBe(true);
    expect(result.scenario).toBe("CHECK_IN");
    expect(result.status).toBe("Terlambat");
    expect(result.isLate).toBe(true);
    expect(result.deviationMinutes).toBe(35);

    // Verify database record
    const today = new Date(scanTime);
    today.setHours(0, 0, 0, 0);

    const dbRecord = await prisma.absensi.findUnique({
      where: {
        karyawan_id_tanggal: {
          karyawan_id: lateEmpId,
          tanggal: today,
        },
      },
    });

    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.status_masuk).toBe("Terlambat");
    expect(dbRecord?.waktu_masuk).not.toBeNull();
    expect(dbRecord?.waktu_pulang).toBeNull();
  });

  // =========================================================================
  // SCENARIO 3: Valid Check-Out (Second scan on the same day)
  // =========================================================================
  test("Scenario 3: Valid Check-Out updates waktu_pulang on existing record without creating a new row", async () => {
    const morningTime = new Date();
    morningTime.setHours(7, 55, 0, 0);

    // First scan: Morning Check-In
    const firstScan = await recordAttendancePunch(testCheckoutEmpQr, {
      customTime: morningTime.toISOString(),
    });
    expect(firstScan.success).toBe(true);
    expect(firstScan.scenario).toBe("CHECK_IN");

    const today = new Date(morningTime);
    today.setHours(0, 0, 0, 0);

    const initialRows = await prisma.absensi.findMany({
      where: {
        karyawan_id: checkoutEmpId,
        tanggal: today,
      },
    });
    expect(initialRows.length).toBe(1);
    const existingRecordId = initialRows[0].id;

    // Second scan: Evening Check-Out at 17:15 PM
    const eveningTime = new Date();
    eveningTime.setHours(17, 15, 0, 0);

    const secondScan = await recordAttendancePunch(testCheckoutEmpQr, {
      customTime: eveningTime.toISOString(),
    });

    expect(secondScan.success).toBe(true);
    expect(secondScan.scenario).toBe("CHECK_OUT");
    expect(secondScan.status).toBe("Checked Out");

    // Verify database state: exactly 1 row exists and waktu_pulang is populated
    const updatedRows = await prisma.absensi.findMany({
      where: {
        karyawan_id: checkoutEmpId,
        tanggal: today,
      },
    });

    expect(updatedRows.length).toBe(1);
    expect(updatedRows[0].id).toBe(existingRecordId);
    expect(updatedRows[0].waktu_pulang).not.toBeNull();
  });

  // =========================================================================
  // SCENARIO 4: Duplicate Scan Rejection (Third scan when both times are filled)
  // =========================================================================
  test("Scenario 4: Third scan returns duplicate error and prevents further updates", async () => {
    const morningTime = new Date();
    morningTime.setHours(7, 50, 0, 0);

    const eveningTime = new Date();
    eveningTime.setHours(17, 30, 0, 0);

    // 1. Perform Check-In
    await recordAttendancePunch(testDuplicateEmpQr, {
      customTime: morningTime.toISOString(),
    });

    // 2. Perform Check-Out
    await recordAttendancePunch(testDuplicateEmpQr, {
      customTime: eveningTime.toISOString(),
    });

    // 3. Perform Third Scan at 18:00 PM
    const thirdScanTime = new Date();
    thirdScanTime.setHours(18, 0, 0, 0);

    const thirdScan = await recordAttendancePunch(testDuplicateEmpQr, {
      customTime: thirdScanTime.toISOString(),
    });

    expect(thirdScan.success).toBe(false);
    expect(thirdScan.scenario).toBe("DUPLICATE");
    expect(thirdScan.type).toBe("ALREADY_COMPLETED");
    expect(thirdScan.message).toContain("Attendance completed for today");
  });

  // =========================================================================
  // SCENARIO 5: Invalid QR (Non-existent qr_code_id)
  // =========================================================================
  test("Scenario 5: Scan with non-existent QR token returns Not Found / Invalid QR error", async () => {
    const result = await recordAttendancePunch(invalidQrCode);

    expect(result.success).toBe(false);
    expect(result.type).toBe("INVALID_QR");
    expect(result.message).toContain("not recognized");
  });

  // =========================================================================
  // API ROUTE VALIDATION (/api/attendance) using NextRequest
  // =========================================================================
  test("API Route POST /api/attendance handles valid punch and returns 200 HTTP status", async () => {
    const testApiEmpQr = "QR-TEST-API-05";
    const emp = await prisma.karyawan.upsert({
      where: { qr_code_id: testApiEmpQr },
      update: { nama_lengkap: "Test Emp API", jabatan: "QA" },
      create: {
        nama_lengkap: "Test Emp API",
        jabatan: "QA",
        qr_code_id: testApiEmpQr,
      },
    });

    const now = new Date();
    now.setHours(7, 30, 0, 0);

    const req = new NextRequest("http://localhost:3000/api/attendance", {
      method: "POST",
      body: JSON.stringify({
        qr_code_id: testApiEmpQr,
        customTime: now.toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.scenario).toBe("CHECK_IN");
    expect(json.status).toBe("Tepat Waktu");

    // Clean up
    await prisma.absensi.deleteMany({ where: { karyawan_id: emp.id } });
    await prisma.karyawan.delete({ where: { id: emp.id } });
  });

  test("API Route POST /api/attendance returns 404 for invalid QR token", async () => {
    const req = new NextRequest("http://localhost:3000/api/attendance", {
      method: "POST",
      body: JSON.stringify({
        qr_code_id: "TOTALLY-FAKE-QR-ID",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.type).toBe("INVALID_QR");
  });
});
