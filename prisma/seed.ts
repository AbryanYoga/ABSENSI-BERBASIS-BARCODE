import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

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
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
