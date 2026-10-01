const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    console.log("Admin already exists:", existing.username);
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@123456", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "adhamindo1981@gmail.com",
      passwordHash: passwordHash,
      role: "ADMIN",
      isApproved: true,
      mustChangePassword: false,
      referralCode: "UBK-ADMIN",
      whatsapp: "6285110539752",
    },
  });

  // Also create a sample approved marketer
  const marketerHash = await bcrypt.hash("Ubk@123456", 10);
  const marketer = await prisma.user.create({
    data: {
      username: "Ustadz_Fauzan",
      email: "fauzan@ubkumrah.com",
      passwordHash: marketerHash,
      role: "MARKETER",
      isApproved: true,
      mustChangePassword: false,
      referralCode: "UBK-FAUZAN",
      whatsapp: "6285110539752",
      parentId: admin.id,
      bankName: "Bank Syariah Indonesia (BSI)",
      bankAccountNumber: "7123456789",
      bankAccountName: "Fauzan Abdullah",
    },
  });

  console.log("Created Admin:", admin.username, admin.email);
  console.log("Created Sample Marketer:", marketer.username, marketer.referralCode);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
