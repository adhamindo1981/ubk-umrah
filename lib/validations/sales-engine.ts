import { z } from "zod";

/**
 * Normalizes Indonesian WhatsApp phone numbers to the international standard format: "628xxxxxxxxxx".
 * Handles formats like:
 * - 081234567890 -> 6281234567890
 * - +62 812-3456-7890 -> 6281234567890
 * - 81234567890 -> 6281234567890
 * - 6281234567890 -> 6281234567890
 */
export function normalizeIndonesianPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "").trim();

  // Strip leading plus
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 08, convert to 628
  if (cleaned.startsWith("08")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Regex validating normalized Indonesian WhatsApp number: 628 followed by 8 to 12 digits.
 */
export const INDONESIA_WA_REGEX = /^628\d{8,12}$/;

/**
 * Schema for Marketer adding a new prospect / lead
 */
export const addProspectSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Nama jamaah minimal 2 karakter / اسم المعتمر حرفان على الأقل")
    .max(100, "Nama jamaah maksimal 100 karakter / الاسم طويل جداً"),
  whatsappNumber: z
    .string()
    .trim()
    .transform((val) => normalizeIndonesianPhone(val))
    .refine(
      (val) => INDONESIA_WA_REGEX.test(val),
      "Nomor WhatsApp Indonesia tidak valid (Contoh: 08123456789 atau 628123456789)"
    ),
  packageInterest: z
    .string()
    .trim()
    .min(2, "Pilihan paket wajib diisi")
    .max(150, "Nama paket terlalu panjang"),
  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter")
    .optional()
    .nullable(),
});

/**
 * Schema for Public "Simulasi Tabungan Umrah" Lead Capture Gate
 */
export const publicTabunganLeadSchema = z.object({
  marketerCode: z
    .string()
    .trim()
    .min(3, "Kode referal mitra tidak valid")
    .max(50, "Kode referal terlalu panjang"),
  clientName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  whatsappNumber: z
    .string()
    .trim()
    .transform((val) => normalizeIndonesianPhone(val))
    .refine(
      (val) => INDONESIA_WA_REGEX.test(val),
      "Nomor WhatsApp tidak valid (format: 08123456789 atau 628123456789)"
    ),
  packageChoice: z
    .string()
    .trim()
    .min(2, "Pilihan paket wajib dipilih")
    .max(150, "Pilihan paket terlalu panjang"),
  jamaahCount: z
    .number()
    .int()
    .min(1, "Minimal 1 jamaah")
    .max(10, "Maksimal simulasi untuk 10 jamaah"),
  installmentMonths: z
    .number()
    .int()
    .refine((val) => [3, 6, 12, 18].includes(val), "Pilihan angsuran hanya 3, 6, 12, atau 18 bulan"),
  totalPrice: z
    .number()
    .min(20000000, "Total harga paket tidak valid")
    .max(500000000, "Total harga melebihi batas wajar"),
  dpAmount: z
    .number()
    .min(5000000, "DP minimal Rp 5.000.000")
    .max(100000000, "Nominal DP terlalu besar"),
  monthlyInstallment: z
    .number()
    .min(100000, "Estimasi tabungan bulanan tidak valid")
    .max(100000000, "Estimasi bulanan tidak valid"),
});

/**
 * Schema for claiming a lead from the Roulette Pool
 */
export const claimRouletteLeadSchema = z.object({
  rouletteId: z
    .string()
    .trim()
    .min(5, "ID peluang jamaah tidak valid"),
});
