
const crypto = require("crypto");
const ENC_KEY_RAW = process.env.PLAID_TOKEN_ENC_KEY; // 32+ chars recommended
const ENC_KEY = ENC_KEY_RAW
  ? crypto.createHash("sha256").update(ENC_KEY_RAW).digest()
  : null;


function encrypt(text) {
  if (!ENC_KEY) return text; // fallback: store plaintext (not recommended)
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const ciphertext = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // store iv.ciphertext.tag (base64) in one string
  return `${iv.toString("base64")}.${ciphertext.toString(
    "base64"
  )}.${tag.toString("base64")}`;
}

// Decrypt Plaid access token saved as "iv.ciphertext.tag" (base64 each)
function decrypt(packed) {
  // If you stored plaintext (no ENC_KEY at save time), just return it
  if (!ENC_KEY) return packed;

  const parts = (packed || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const [ivB64, ctB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const tag = Buffer.from(tagB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

module.exports = { encrypt, decrypt };
