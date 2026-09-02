import * as crypto from 'crypto';

/**
 * Cifrado legacy (AES-256-CBC) usado al crear usuario y al resetear clave.
 * Misma clave y algoritmo que el flujo anterior; no cambiar sin coordinar con PHP.
 */
export function encryptLegacyPassword(text: string): string {
  try {
    const encryptionKey = Buffer.from(
      'deed168c00e0ef596a84311013083fea',
      'utf8',
    );
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const ivBase64 = iv.toString('base64');
    const combined = `${encrypted}::${ivBase64}`;

    return Buffer.from(combined, 'utf8').toString('base64');
  } catch (err) {
    console.error('Error encriptando clave legacy:', err);
    throw new Error('Error al encriptar contraseña');
  }
}
