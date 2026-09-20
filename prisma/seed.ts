import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Default Pengaturan
  const pengaturan = await prisma.pengaturan.upsert({
    where: { id: 1 },
    update: {
      jam_masuk_normal: "08:00",
    },
    create: {
      id: 1,
      jam_masuk_normal: "08:00",
    },
  });
  console.log("Default Pengaturan initialized:", pengaturan);

  // Sample Employees matching Stitch UI mockups
  const sampleEmployees = [
    {
      nama_lengkap: "Sarah Jenkins",
      jabatan: "Lead Systems Engineer • SecOps",
      qr_code_id: "EMP-1042",
    },
    {
      nama_lengkap: "Marcus Leung",
      jabatan: "Senior Product Designer • UX Core",
      qr_code_id: "EMP-2084",
    },
    {
      nama_lengkap: "Amina Diallo",
      jabatan: "HR Coordinator • People Ops",
      qr_code_id: "EMP-3301",
    },
    {
      nama_lengkap: "Tobias Keller",
      jabatan: "Facility Manager • Operations",
      qr_code_id: "EMP-4112",
    },
    {
      nama_lengkap: "Chloe Nguyen",
      jabatan: "QA Automation Specialist • Engineering",
      qr_code_id: "EMP-5091",
    },
  ];

  for (const emp of sampleEmployees) {
    await prisma.karyawan.upsert({
      where: { qr_code_id: emp.qr_code_id },
      update: {
        nama_lengkap: emp.nama_lengkap,
        jabatan: emp.jabatan,
      },
      create: {
        nama_lengkap: emp.nama_lengkap,
        jabatan: emp.jabatan,
        qr_code_id: emp.qr_code_id,
      },
    });
  }

  console.log("Seeded initial employee records.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
