const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.pilgrimPhoto.count();
  if (count === 0) {
    const photos = [
      {
        title: "Jamaah UBK Tawaf di Pelataran Ka'bah Makkah",
        titleAr: "طواف المعتمرين في صحن المطاف حول الكعبة المشرفة",
        category: "MAKKAH",
        categoryAr: "مكة المكرمة",
        imageUrl: "/images/landmarks/makkah-clock.jpg",
        location: "Masjidil Haram, Makkah",
        year: 2025,
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Kekhusyukan Jamaah di Pelataran Masjid Nabawi Madinah",
        titleAr: "سكينة المعتمرين بين مظلات وساحات المسجد النبوي الشريف",
        category: "MADINAH",
        categoryAr: "المدينة المنورة",
        imageUrl: "/images/landmarks/madinah-nabawi.jpg",
        location: "Al-Masjid An-Nabawi, Madinah",
        year: 2025,
        isActive: true,
        sortOrder: 2,
      },
      {
        title: "Perjalanan Nyaman Jamaah dengan Kereta Cepat Haramain",
        titleAr: "تنقل مريح لأفواج المعتمرين على متن قطار الحرمين السريع",
        category: "ZIARAH",
        categoryAr: "رفاهية التنقل",
        imageUrl: "/images/landmarks/haramain-train.jpg",
        location: "Haramain High Speed Railway",
        year: 2025,
        isActive: true,
        sortOrder: 3,
      },
      {
        title: "Wisata Religi & Alam Teleferik Kereta Gantung Al Hada Taif",
        titleAr: "جولة المعتمرين السياحية في تلفريك الهدا بمرتفعات الطائف",
        category: "ZIARAH",
        categoryAr: "جولات ومزارات",
        imageUrl: "/images/landmarks/taif-cablecar.png",
        location: "Al Hada, Taif",
        year: 2025,
        isActive: true,
        sortOrder: 4,
      },
    ];

    for (const p of photos) {
      await prisma.pilgrimPhoto.create({ data: p });
    }
    console.log("Seeded 4 initial pilgrim photos successfully!");
  } else {
    console.log("Pilgrim photos already exist in database.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
