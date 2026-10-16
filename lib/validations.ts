import { z } from "zod";

/**
 * Escapes special XML characters to prevent SVG injection (XSS in SVG context).
 */
export function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Regex patterns for strict input sanitation
 */
export const PHONE_REGEX = /^\+?[0-9\s\-()]{8,20}$/;
export const USERNAME_REGEX = /^[A-Za-z0-9_.\u0600-\u06FF]{3,50}$/;

/**
 * Umrah Booking Order Registration Schema
 */
export const orderRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter / الاسم قصير جداً")
    .max(100, "Nama maksimal 100 karakter / الاسم طويل جداً"),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid / البريد الإلكتروني غير صالح")
    .max(120, "Email terlalu panjang / البريد طويل جداً")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Nomor telepon tidak valid / رقم الهاتف غير صالح")
    .optional()
    .nullable()
    .or(z.literal("")),
  referralCode: z
    .string()
    .trim()
    .max(30, "Kode referral tidak valid / كود الإحالة غير صالح")
    .optional()
    .nullable()
    .or(z.literal("")),
  package: z
    .string()
    .trim()
    .max(150, "Nama paket terlalu panjang")
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Marketer / Partner Registration Schema
 */
export const registerUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter / اسم المستخدم يجب ألا يقل عن 3 أحرف")
    .max(50, "Username maksimal 50 karakter")
    .regex(USERNAME_REGEX, "Username hanya boleh huruf, angka, garis bawah, dan titik"),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .max(120, "Email terlalu panjang")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter / كلمة المرور يجب ألا تقل عن 6 خانات")
    .max(100, "Password maksimal 100 karakter"),
  whatsapp: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Nomor WhatsApp tidak valid")
    .optional()
    .nullable()
    .or(z.literal("")),
  parentReferralCode: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Payout Request Submission Schema
 */
export const payoutRequestSchema = z.object({
  amountToWithdraw: z
    .number()
    .min(500000, "Minimal penarikan adalah Rp 500.000")
    .max(100000000, "Batas maksimal penarikan per transaksi adalah Rp 100.000.000")
    .refine((val) => val % 500000 === 0, {
      message: "Nominal penarikan harus dalam kelipatan Rp 500.000",
    }),
  bankInfo: z
    .string()
    .trim()
    .min(5, "Informasi bank minimal 5 karakter")
    .max(300, "Informasi bank maksimal 300 karakter"),
});

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
  whatsapp: z.string().trim().regex(PHONE_REGEX, "Nomor WhatsApp tidak valid").optional().or(z.literal("")),
  bankName: z.string().trim().max(100).optional().or(z.literal("")),
  bankAccountNumber: z.string().trim().max(60).optional().or(z.literal("")),
  bankAccountName: z.string().trim().max(100).optional().or(z.literal("")),
  idNumber: z.string().trim().max(50).optional().or(z.literal("")),
  subMarketerShare: z.number().min(100000).max(500000).optional(),
  currentPassword: z.string().max(100).optional().or(z.literal("")),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(100).optional().or(z.literal("")),
});

/**
 * Allowed Image Upload Validation Helper (Max 5MB, strict MIME types)
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateBase64Image(base64String: string): {
  valid: boolean;
  mimeType?: string;
  extension?: string;
  buffer?: Buffer;
  error?: string;
} {
  if (!base64String || typeof base64String !== "string") {
    return { valid: false, error: "Data gambar tidak ditemukan" };
  }

  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { valid: false, error: "Format data gambar tidak valid (harus base64 URL)" };
  }

  const mimeType = matches[1].toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Jenis file (${mimeType}) tidak diizinkan. Hanya JPG, PNG, dan WEBP yang didukung.`,
    };
  }

  const buffer = Buffer.from(matches[2], "base64");
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimal (5MB). Ukuran saat ini: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB`,
    };
  }

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return {
    valid: true,
    mimeType,
    extension: extMap[mimeType] || "jpg",
    buffer,
  };
}

/**
 * Lead Management (Mini-CRM & Tabungan Umrah) Schemas
 */
export const createLeadSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Nama prospek minimal 2 karakter")
    .max(100, "Nama prospek maksimal 100 karakter"),
  whatsappNumber: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Nomor WhatsApp tidak valid (contoh: 0812... atau +62...)"),
  source: z
    .enum(["MANUAL_MISSION", "TABUNGAN_CALCULATOR", "RADAR_ROULETTE", "LANDING_PAGE"])
    .optional()
    .default("MANUAL_MISSION"),
  status: z
    .enum(["NEW", "CONTACTED", "INTERESTED", "DP_PAID", "CLOSED_WON"])
    .optional()
    .default("NEW"),
  packageInterest: z
    .string()
    .trim()
    .min(2, "Minat paket wajib diisi")
    .max(150, "Nama paket terlalu panjang"),
  dpAmount: z.number().min(0).max(100000000).optional().default(5000000),
  monthlyPlan: z.number().min(0).max(50000000).optional().nullable(),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional().nullable(),
});

export const updateLeadSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "INTERESTED", "DP_PAID", "CLOSED_WON"]).optional(),
  notes: z.string().trim().max(500).optional().nullable(),
  packageInterest: z.string().trim().max(150).optional(),
  monthlyPlan: z.number().min(0).max(50000000).optional().nullable(),
  lastContactedAt: z.boolean().optional(), // if true, sets lastContactedAt to now()
});

/**
 * Normalizes phone numbers to WhatsApp international format (especially Indonesian 62xxx)
 */
export function normalizeIndonesianPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Gamified Daily Mission Progress Schema
 */
export const updateMissionProgressSchema = z.object({
  action: z.enum(["ADD_CONTACT", "SEND_WHATSAPP"]),
  increment: z.number().min(1).max(5).optional().default(1),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
});

/**
 * Radar Roulette Claim Schema
 */
export const claimRouletteSchema = z.object({
  rouletteId: z.string().min(5, "ID peluang tidak valid"),
});

