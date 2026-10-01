import QRCode from "qrcode";

/**
 * Generate a short, clean, human-readable referral code.
 * Example format: "UBK-8K3P" or "UBK-7A9X"
 */
export function generateShortReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars like O, 0, I, 1
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }
  return `UBK-${randomPart}`;
}

/**
 * Generate a Data URL (base64 image) for a QR Code given a URL or text string.
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: "#047857", // Emerald theme color
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR Code:", err);
    return "";
  }
}
