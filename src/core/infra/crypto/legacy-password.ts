import * as crypto from 'crypto';

const LEGACY_AES_KEY = Buffer.from('deed168c00e0ef596a84311013083fea', 'utf8');

/**
 * AES-256-CBC del legado PHP (openssl options=0).
 * Misma key/IV framing: base64(ciphertext_b64 + '::' + iv_b64).
 */
export function encryptLegacyPassword(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', LEGACY_AES_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const combined = `${encrypted}::${iv.toString('base64')}`;
  return Buffer.from(combined, 'utf8').toString('base64');
}

export function decryptLegacyPassword(encoded: string): string | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [encryptedDataBase64, ivBase64] = decoded.split('::');
    if (!encryptedDataBase64 || !ivBase64) return null;

    const encryptedData = Buffer.from(encryptedDataBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', LEGACY_AES_KEY, iv);
    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

/** Campo `clave` de intranet ventas: MD5 hex de 32 chars (PHP hex_md5). */
export function md5Hex(text: string): string {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex');
}
