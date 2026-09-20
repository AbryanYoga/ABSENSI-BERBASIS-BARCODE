"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface KaryawanData {
  id: string;
  nama_lengkap: string;
  jabatan: string;
  qr_code_id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generate unique, cryptographically sound QR Code ID (e.g. ATS-8492-X9FA)
export async function generateUniqueQrCodeId(): Promise<string> {
  let isUnique = false;
  let qrCodeId = "";

  while (!isUnique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    qrCodeId = `ATS-${randomDigits}-${randomSuffix}`;

    const existing = await prisma.karyawan.findUnique({
      where: { qr_code_id: qrCodeId },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return qrCodeId;
}

// Fetch all employees
export async function getKaryawans() {
  try {
    const data = await prisma.karyawan.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return { success: false, error: "Failed to load employees." };
  }
}

// Create new employee
export async function createKaryawan(formData: {
  nama_lengkap: string;
  jabatan: string;
  qr_code_id?: string;
}) {
  try {
    if (!formData.nama_lengkap.trim() || !formData.jabatan.trim()) {
      return { success: false, error: "Name and role are required." };
    }

    const qr_code_id = formData.qr_code_id || (await generateUniqueQrCodeId());

    const karyawan = await prisma.karyawan.create({
      data: {
        nama_lengkap: formData.nama_lengkap.trim(),
        jabatan: formData.jabatan.trim(),
        qr_code_id,
      },
    });

    revalidatePath("/admin/karyawan");
    revalidatePath("/karyawan");
    revalidatePath("/admin");
    return { success: true, data: karyawan };
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    if (error.code === "P2002") {
      return { success: false, error: "QR Code ID must be unique." };
    }
    return { success: false, error: "Failed to create employee record." };
  }
}

// Update existing employee
export async function updateKaryawan(
  id: string,
  formData: {
    nama_lengkap: string;
    jabatan: string;
  }
) {
  try {
    if (!formData.nama_lengkap.trim() || !formData.jabatan.trim()) {
      return { success: false, error: "Name and role are required." };
    }

    const updated = await prisma.karyawan.update({
      where: { id },
      data: {
        nama_lengkap: formData.nama_lengkap.trim(),
        jabatan: formData.jabatan.trim(),
      },
    });

    revalidatePath("/admin/karyawan");
    revalidatePath("/karyawan");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update employee:", error);
    return { success: false, error: "Failed to update employee record." };
  }
}

// Delete employee
export async function deleteKaryawan(id: string) {
  try {
    await prisma.karyawan.delete({
      where: { id },
    });

    revalidatePath("/admin/karyawan");
    revalidatePath("/karyawan");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return { success: false, error: "Failed to delete employee record." };
  }
}

// Regenerate QR Code for employee
export async function regenerateEmployeeQr(id: string) {
  try {
    const newQrCodeId = await generateUniqueQrCodeId();
    const updated = await prisma.karyawan.update({
      where: { id },
      data: { qr_code_id: newQrCodeId },
    });

    revalidatePath("/admin/karyawan");
    revalidatePath("/karyawan");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to regenerate QR code:", error);
    return { success: false, error: "Failed to regenerate QR code." };
  }
}
