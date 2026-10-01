const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function generateFeedTemplateSvg(title, subtitle, price, bgGradStart, bgGradEnd, isWatermarked = false) {
  const watermarkOverlay = isWatermarked
    ? `
    <g transform="rotate(-35 540 540)" opacity="0.38">
      <rect x="-200" y="480" width="1500" height="120" fill="rgba(239, 68, 68, 0.25)" rx="20"/>
      <text x="540" y="555" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="4">
        UBK PREVIEW • DILARANG MENYALIN • HAK CIPTA DILINDUNGI
      </text>
    </g>
    <g transform="rotate(-35 540 840)" opacity="0.25">
      <text x="540" y="855" font-family="Arial, sans-serif" font-size="36" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="3">
        UNTUK PEMASARAN RESMI UMAR BIN AL-KHATTAB FOR UMRAH
      </text>
    </g>
  `
    : "";

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
    <defs>
      <linearGradient id="bg_${bgGradStart.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1080" height="1080" fill="url(#bg_${bgGradStart.replace('#','')})"/>

    <!-- Decorative Top Arch & Islamic Geometric Accent -->
    <circle cx="540" cy="-200" r="600" fill="none" stroke="rgba(251, 191, 36, 0.15)" stroke-width="2"/>
    <circle cx="540" cy="-200" r="540" fill="none" stroke="rgba(251, 191, 36, 0.2)" stroke-width="3"/>
    <circle cx="540" cy="-200" r="480" fill="none" stroke="rgba(251, 191, 36, 0.1)" stroke-width="1.5"/>

    <!-- Header Logo & Brand -->
    <rect x="340" y="70" width="400" height="48" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1.5"/>
    <text x="540" y="102" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="3">
      UMAR BIN AL-KHATTAB FOR UMRAH (UBK)
    </text>

    <!-- Main Title Card -->
    <text x="540" y="220" font-family="'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${title}
    </text>
    <text x="540" y="270" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#a7f3d0" text-anchor="middle">
      ${subtitle}
    </text>

    <!-- Center Kaaba Graphic Symbol Placeholder -->
    <g transform="translate(440, 320)">
      <rect x="0" y="0" width="200" height="200" rx="24" fill="#09090b" stroke="url(#gold)" stroke-width="4"/>
      <rect x="0" y="40" width="200" height="18" fill="url(#gold)"/>
      <polygon points="100,85 120,135 80,135" fill="url(#gold)"/>
      <circle cx="100" cy="155" r="8" fill="url(#gold)"/>
    </g>

    <!-- Pricing Badge -->
    <rect x="290" y="560" width="500" height="90" rx="45" fill="rgba(0,0,0,0.4)" stroke="url(#gold)" stroke-width="2.5"/>
    <text x="540" y="600" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#cbd5e1" text-anchor="middle">
      HARGA MULAI DARI (ALL IN)
    </text>
    <text x="540" y="635" font-family="'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#fbbf24" text-anchor="middle">
      ${price}
    </text>

    <!-- Features / Bullet Points -->
    <g transform="translate(180, 690)">
      <rect x="0" y="0" width="720" height="180" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="50" y="50" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">✈️ Tiket Pesawat PP Direct Tanpa Transit</text>
      <text x="50" y="90" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">🏨 Hotel Pilihan Dekat Masjidil Haram & Nabawi</text>
      <text x="50" y="130" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">🕋 Bimbingan Ibadah Sesuai Sunnah & Muthawif</text>
      <text x="50" y="165" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">🛡️ Visa Umrah Resmi & Asuransi Perjalanan</text>
    </g>

    <!-- Dynamic Auto-Branding Footer Area (Stamped for Marketers) -->
    <g id="marketer-branding-slot">
      <rect x="40" y="900" width="1000" height="140" rx="28" fill="#ffffff" stroke="url(#gold)" stroke-width="3"/>
      
      <!-- Marketer Icon Badge -->
      <circle cx="110" cy="970" r="42" fill="#047857"/>
      <text x="110" y="982" font-family="sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">🕋</text>

      <text x="180" y="948" font-family="sans-serif" font-size="15" font-weight="800" fill="#047857" letter-spacing="1">
        KONSULTASI & PENDAFTARAN RESMI MELALUI MITRA KAMI:
      </text>
      <text id="branding-name" x="180" y="980" font-family="sans-serif" font-size="26" font-weight="900" fill="#0f172a">
        {{MARKETER_NAME}}
      </text>
      <text id="branding-wa" x="180" y="1012" font-family="monospace" font-size="18" font-weight="700" fill="#15803d">
        📲 WhatsApp: {{MARKETER_WHATSAPP}} | Kode Mitra: {{MARKETER_CODE}}
      </text>

      <!-- License & Scan Badge -->
      <rect x="790" y="920" width="225" height="100" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="902" y="955" font-family="sans-serif" font-size="12" font-weight="800" fill="#64748b" text-anchor="middle">
        LISENSI DIGITAL RESMI
      </text>
      <text id="branding-lic" x="902" y="982" font-family="monospace" font-size="13" font-weight="800" fill="#047857" text-anchor="middle">
        {{LICENSE_KEY}}
      </text>
      <text x="902" y="1005" font-family="sans-serif" font-size="10" font-weight="600" fill="#94a3b8" text-anchor="middle">
        UMAR BIN AL-KHATTAB FOR UMRAH
      </text>
    </g>

    ${watermarkOverlay}
  </svg>
  `.trim();
}

async function main() {
  console.log("Seeding Poster Marketplace templates...");

  const templates = [
    {
      title: "UMRAH REGULER AWAL MUSIM 1448 H",
      subtitle: "Paket 9 Hari Nyaman & Khusyuk Sesuai Sunnah",
      price: "Rp 28.500.000",
      description: "Desain feed Instagram persegi (1:1) elegan bernuansa hijau zamrud dengan rincian fasilitas lengkap dan harga promo.",
      priceNumeric: 25000,
      category: "INSTAGRAM_FEED",
      bgStart: "#022c22",
      bgEnd: "#064e3b",
    },
    {
      title: "UMRAH VIP EKSKLUSIF 12 HARI",
      subtitle: "Hotel Bintang 5 Pelataran Masjidil Haram & Nabawi",
      price: "Rp 36.900.000",
      description: "Desain mewah bertema emas & hitam kerajaan untuk membidik jamaah VIP dan eksekutif.",
      priceNumeric: 35000,
      category: "INSTAGRAM_FEED",
      bgStart: "#09090b",
      bgEnd: "#1c1917",
    },
    {
      title: "SPESIAL RAMADHAN PENUH BERKAH",
      subtitle: "Raih Lailatul Qadar & Keutamaan Umrah Seperti Haji Bersama Nabi",
      price: "Rp 38.500.000",
      description: "Desain bertema Ramadhan suci dengan kaligrafi estetik untuk promosi keberangkatan bulan puasa.",
      priceNumeric: 30000,
      category: "INSTAGRAM_FEED",
      bgStart: "#1e1b4b",
      bgEnd: "#0f172a",
    },
    {
      title: "UMRAH PLUS WISATA HALAL TURKI & CAPPADOCIA",
      subtitle: "12 Hari Ibadah Khusyuk & Wisata Jejak Sejarah Kejayaan Islam",
      price: "Rp 44.500.000",
      description: "Desain promosi paket kombinasi Umrah dan wisata religi Istanbul - Bursa - Cappadocia.",
      priceNumeric: 40000,
      category: "INSTAGRAM_FEED",
      bgStart: "#134e4a",
      bgEnd: "#042f2e",
    },
  ];

  for (const t of templates) {
    const cleanSvg = generateFeedTemplateSvg(t.title, t.subtitle, t.price, t.bgStart, t.bgEnd, false);
    const previewSvg = generateFeedTemplateSvg(t.title, t.subtitle, t.price, t.bgStart, t.bgEnd, true);

    const cleanImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
    const previewImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(previewSvg)}`;

    const existing = await prisma.posterTemplate.findFirst({
      where: { title: t.title },
    });

    if (!existing) {
      await prisma.posterTemplate.create({
        data: {
          title: t.title,
          description: t.description,
          price: t.priceNumeric,
          previewImageUrl,
          cleanImageUrl,
          category: t.category,
        },
      });
      console.log(`Created template: ${t.title}`);
    } else {
      await prisma.posterTemplate.update({
        where: { id: existing.id },
        data: {
          description: t.description,
          price: t.priceNumeric,
          previewImageUrl,
          cleanImageUrl,
          category: t.category,
        },
      });
      console.log(`Updated template: ${t.title}`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
