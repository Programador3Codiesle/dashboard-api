export const MOTIVOS_ADJUNTO_AUSENTISMO = [
  'Compensatorio Jurado de Votación',
  'Compensatorio Votantes',
  'Cita Medica/Odontológica DEL TRABAJADOR',
  'Estudio',
  'Calamidad Doméstica',
] as const;

export const ADJUNTO_AUSENTISMO_MAX_BYTES = 5 * 1024 * 1024;

const EXTS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp']);
const MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export const MSG_ADJUNTO_AUSENTISMO =
  'El archivo debe ser imagen o PDF (máx. 5 MB)';

export function motivoRequiereAdjunto(motivo: string): boolean {
  return (MOTIVOS_ADJUNTO_AUSENTISMO as readonly string[]).includes(motivo);
}

export function extensionAdjuntoAusentismo(nombre: string): string {
  const i = nombre.lastIndexOf('.');
  return i >= 0 ? nombre.slice(i + 1).toLowerCase() : '';
}

export function validarAdjuntoAusentismo(file: {
  originalname: string;
  size: number;
  mimetype?: string;
}): string | null {
  if (!file || file.size <= 0 || file.size > ADJUNTO_AUSENTISMO_MAX_BYTES) {
    return MSG_ADJUNTO_AUSENTISMO;
  }
  const ext = extensionAdjuntoAusentismo(file.originalname);
  if (!EXTS.has(ext)) return MSG_ADJUNTO_AUSENTISMO;
  const mime = file.mimetype?.trim();
  if (mime && !MIMES.has(mime)) return MSG_ADJUNTO_AUSENTISMO;
  return null;
}

export function nombreAdjuntoAusentismo(
  nit: number,
  originalname: string,
): string {
  const ext = extensionAdjuntoAusentismo(originalname) || 'bin';
  const nitSafe = String(nit).replace(/[^0-9A-Za-z_-]/g, '');
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);
  const uniq = Math.random().toString(16).slice(2, 10);
  return `ausen_${nitSafe}_${stamp}_${uniq}.${ext}`;
}
