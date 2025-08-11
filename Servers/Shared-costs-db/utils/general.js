function normalizePhone(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();

  // Already looks like E.164
  if (/^\+\d{10,15}$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  // Fallback: reject invalid formats
  return null;
}

module.exports = {normalizePhone}