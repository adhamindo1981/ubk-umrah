const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial dynamic Umrah Packages...");

  const count = await prisma.umrahPackage.count();
  if (count > 0) {
    console.log(`Packages already exist (${count} packages). Skipping seed.`);
    return;
  }

  const initialPackages = [
    {
      title: "UMRAH TAYSIR PROGRAM 9 HARI 2026",
      titleAr: "برنامج عمرة التيسير 9 أيام 2026",
      badge: "Paling Diminati",
      badgeAr: "الأكثر طلباً",
      year: 2026,
      month: "Desember",
      programDays: 9,
      downPayment: 5000000,
      airline: "Qatar Airways",
      makkahHotel: "Jada Ajyad / Kayan Raya / Setaraf ⭐⭐⭐ (4 Malam)",
      madinahHotel: "Andalus Salam / Nada Salam / Setaraf ⭐⭐⭐ (3 Malam)",
      freebies: JSON.stringify([
        "Welcome Drink Air Zam-Zam Segar",
        "1 Box Paket ALBAIK Chicken",
        "City Tour & Full Ziarah Madinah & Makkah"
      ]),
      inclusions: JSON.stringify([
        "Full Bimbingan Ibadah & Manasik Sesuai Sunnah",
        "Handling Bandara & Tiket Pesawat PP Internasional",
        "Visa Umrah Resmi + Asuransi Siskopatuh",
        "Didampingi Tour Leader Berpengalaman & Muthowwif",
        "Hotel Dekat Tanpa Perlu Shuttle & Makan 3x Sehari",
        "City Tour Bersejarah Makkah & Madinah",
        "Koper Eksklusif & Perlengkapan Umrah Lengkap",
        "Air Zam-Zam 5 Liter Resmi",
        "Asuransi Perjalanan Syariah"
      ]),
      priceQuad: 31500000,
      priceTriple: 32500000,
      priceDouble: 34900000,
      scholarLeader: "Pimpinan Ma'had Umar bin Khattab - Sheikh Dr. Hassan Bugis & Istri Ummi Nurlaila",
      notes: "Harga & jadwal sewaktu-waktu dapat berubah mengikuti kebijakan pemerintah atau maskapai. Kurs maksimal patokan: Rp 18.000 (USD) & Rp 4.800 (Riyal).",
      customFields: JSON.stringify([
        { label: "Nomor Izin PPIU", value: "U-271 Tahun 2021" },
        { label: "Kantor Wilayah", value: "Bogor, Jawa Barat" }
      ]),
      isPopular: true,
      isActive: true,
    },
    {
      title: "UMRAH VIP EKSKLUSIF 12 HARI",
      titleAr: "برنامج عمرة VIP الفاخر 12 يوماً",
      badge: "VIP Pelataran Haram",
      badgeAr: "فنادق ساحة الحرم",
      year: 2026,
      month: "Januari - Februari",
      programDays: 12,
      downPayment: 7500000,
      airline: "Saudia Airlines (Direct Flight)",
      makkahHotel: "Pullman Zamzam / Fairmount Clock Tower ⭐⭐⭐⭐⭐ (6 Malam)",
      madinahHotel: "Dallah Taibah / Anwar Al Madinah Movenpick ⭐⭐⭐⭐⭐ (5 Malam)",
      freebies: JSON.stringify([
        "Welcome Drink Zam-Zam & Kurma Ajwa",
        "Akses Exclusive Executive Lounge Bandara",
        "Free Kereta Cepat Haramain Makkah-Madinah"
      ]),
      inclusions: JSON.stringify([
        "Tiket Pesawat Direct Jakarta-Jeddah / Madinah-Jakarta PP",
        "Hotel Bintang 5 Pelataran Masjidil Haram & Nabawi",
        "Makan 3x Sehari Fullboard Menu Internasional & Indonesia",
        "Handling Bandara VIP & Fast Track",
        "Koper Fiber Premium & Kain Ihram / Mukena Sutra",
        "Air Zam-Zam 5 Liter & Asuransi Jiwa & Medis Penuh"
      ]),
      priceQuad: 38900000,
      priceTriple: 41500000,
      priceDouble: 44900000,
      scholarLeader: "Dewan Pembina Asatidz UBK Umrah",
      notes: "Fasilitas terbaik untuk lansia dan keluarga.",
      customFields: JSON.stringify([
        { label: "Layanan Khusus", value: "Wheelchair assistance tersedia" }
      ]),
      isPopular: false,
      isActive: true,
    },
    {
      title: "UMRAH PLUS WISATA TURKI HALAL 12 HARI",
      titleAr: "برنامج عمرة بلس تركيا (سياحة إسلامية) 12 يوماً",
      badge: "Plus Wisata Sejarah",
      badgeAr: "شامل جولات إسطنبول",
      year: 2026,
      month: "Maret - Ramadhan",
      programDays: 12,
      downPayment: 10000000,
      airline: "Turkish Airlines",
      makkahHotel: "Anjum Makkah / Setaraf ⭐⭐⭐⭐ (4 Malam)",
      madinahHotel: "Grand Plaza Madinah / Setaraf ⭐⭐⭐⭐ (4 Malam)",
      freebies: JSON.stringify([
        "Bosphorus Cruise Tour Istanbul",
        "Makan Siang Khas Ottoman & Turkish Tea",
        "Air Zam-Zam 5 Liter"
      ]),
      inclusions: JSON.stringify([
        "Tiket Pesawat Jakarta-Istanbul-Madinah-Jeddah-Jakarta",
        "City Tour Istanbul (Blue Mosque, Hagia Sophia, Topkapi Palace)",
        "Hotel Bintang 4 di Istanbul, Makkah, dan Madinah",
        "Makan 3x Sehari Halal Fullboard",
        "Visa Umrah + Visa Turki Turistik",
        "Perlengkapan Umrah & Traveling Lengkap"
      ]),
      priceQuad: 44500000,
      priceTriple: 47000000,
      priceDouble: 49900000,
      scholarLeader: "Ustadz Pembimbing & Tour Leader Turki Berlisensi",
      notes: "Musim semi di Turki dengan pemandangan bunga Tulip.",
      customFields: JSON.stringify([
        { label: "Destinasi Wisata", value: "Istanbul, Bursa, Makkah, Madinah" }
      ]),
      isPopular: false,
      isActive: true,
    }
  ];

  for (const pkg of initialPackages) {
    await prisma.umrahPackage.create({ data: pkg });
  }

  console.log("Successfully seeded 3 dynamic Umrah Packages!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
