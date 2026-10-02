/**
 * Official Corporate Bank Account Configuration for UBK Umrah.
 * Used across booking forms, confirmation modals, invoices, and anti-fraud notices.
 */
export const OFFICIAL_BANK_CONFIG = {
  bankName: process.env.NEXT_PUBLIC_OFFICIAL_BANK_NAME || "Bank Syariah Indonesia (BSI)",
  accountNumber: process.env.NEXT_PUBLIC_OFFICIAL_BANK_ACCOUNT || "7200-8899-1001",
  accountHolder: process.env.NEXT_PUBLIC_OFFICIAL_BANK_HOLDER || "PT. UMAR BIN AL-KHATTAB FOR UMRAH",
  swiftCode: "BSMDIDJA",
  branch: "Cabang Khusus Haji & Umrah Bogor",
  currency: "IDR (Rupiah)",
  
  // Secondary account (optional, e.g. Bank Mandiri)
  secondaryBank: {
    bankName: "Bank Mandiri",
    accountNumber: "133-00-9988112-0",
    accountHolder: "PT. UMAR BIN AL-KHATTAB FOR UMRAH",
  },
};
