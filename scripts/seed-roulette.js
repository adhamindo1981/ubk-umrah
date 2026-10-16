const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existingCount = await prisma.leadRoulette.count({ where: { status: "AVAILABLE" } });
  if (existingCount > 0) {
    console.log(`Radar pool already has ${existingCount} available hot leads.`);
    return;
  }

  const sampleLeads = [
    {
      clientName: "H. Bambang Sudrajat",
      whatsappNumber: "081289110293",
      city: "Jakarta Selatan",
      packageInterest: "Paket Umrah Taysir 9 Hari (Quad) - Rp 29.900.000",
    },
    {
      clientName: "Ibu Hj. Ratna Sari",
      whatsappNumber: "085718223910",
      city: "Bogor Timur",
      packageInterest: "Paket Umrah Syawal Berkah (Double) - Rp 34.500.000",
    },
    {
      clientName: "Keluarga dr. Hendra Wijaya",
      whatsappNumber: "081399881240",
      city: "Depok / Cibubur",
      packageInterest: "Paket Umrah Akhir Tahun VIP (Triple) - Rp 32.500.000",
    },
    {
      clientName: "Ustadz H. Ahmad Ridwan",
      whatsappNumber: "087812903811",
      city: "Tangerang Selatan",
      packageInterest: "Program Tabungan Umrah DP 5 Juta",
    },
    {
      clientName: "Ibu Kartika Ningrum",
      whatsappNumber: "082190883344",
      city: "Bekasi Barat",
      packageInterest: "Paket Umrah Reguler 12 Hari - Rp 31.500.000",
    },
  ];

  for (const lead of sampleLeads) {
    await prisma.leadRoulette.create({
      data: {
        clientName: lead.clientName,
        whatsappNumber: lead.whatsappNumber,
        city: lead.city,
        packageInterest: lead.packageInterest,
        status: "AVAILABLE",
      },
    });
  }

  console.log("Successfully seeded 5 initial hot leads into Lead Roulette Radar!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
