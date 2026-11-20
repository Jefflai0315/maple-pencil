/**
 * PayNow (SGQR / EMVCo Merchant-Presented QR) payload builder.
 *
 * Produces the string that gets encoded into a scannable PayNow QR code.
 * Supports UEN-based merchants with an editable ("pay what you want") amount.
 */

export interface PayNowOptions {
  /** UEN or mobile number (mobile must be +65XXXXXXXX). */
  proxyValue: string;
  /** "uen" or "mobile". Defaults to uen. */
  proxyType?: "uen" | "mobile";
  /** Merchant/company name shown in banking apps. */
  merchantName: string;
  /** If provided, locks the amount. Omit for "pay what you want". */
  amount?: number;
  /** Optional reference shown on the payer's statement. */
  reference?: string;
  /** Merchant city. Defaults to Singapore. */
  city?: string;
}

function formatField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) used by the EMVCo QR spec. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPayNowPayload(options: PayNowOptions): string {
  const {
    proxyValue,
    proxyType = "uen",
    merchantName,
    amount,
    reference,
    city = "Singapore",
  } = options;

  const amountEditable = amount === undefined ? "1" : "0";

  // Tag 26 — Merchant Account Information (PayNow template)
  const merchantAccount =
    formatField("00", "SG.PAYNOW") +
    formatField("01", proxyType === "mobile" ? "0" : "2") +
    formatField("02", proxyValue) +
    formatField("03", amountEditable);

  let payload =
    formatField("00", "01") + // Payload format indicator
    formatField("01", "11") + // Static (reusable) QR
    formatField("26", merchantAccount) +
    formatField("52", "0000") + // Merchant category code (unspecified)
    formatField("53", "702") + // Currency: SGD
    (amount !== undefined
      ? formatField("54", amount.toFixed(2))
      : "") +
    formatField("58", "SG") + // Country
    formatField("59", merchantName.slice(0, 25)) +
    formatField("60", city.slice(0, 15)); // Merchant city

  if (reference) {
    payload += formatField("62", formatField("01", reference.slice(0, 25)));
  }

  // Tag 63 — CRC (computed over everything incl. "6304")
  payload += "6304";
  payload += crc16(payload);

  return payload;
}

/** Playing with Pencil merchant details. */
export const PWP_PAYNOW: PayNowOptions = {
  proxyValue: "202620687M",
  proxyType: "uen",
  merchantName: "Playing with Pencil",
  city: "Singapore",
};
