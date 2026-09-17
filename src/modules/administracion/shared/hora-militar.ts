/** Rangos e intervalo del timepicker PHP (jquery.timepicker). */

export const INTERVALO_MINUTOS_HORA = 5;

export const AUSENTISMO_HORA_MIN = '06:00';
export const AUSENTISMO_HORA_MAX = '20:00';

export const HORAS_EXTRA_INI_MIN = '05:00';
export const HORAS_EXTRA_INI_MAX = '18:00';

export const HORAS_EXTRA_FIN_MIN = '05:00';
export const HORAS_EXTRA_FIN_MAX = '23:00';

export const MOTIVOS_RECUPERACION_AUSENTISMO = ['Personal', 'Estudio'] as const;

export type TramoRecuperacion = {
  fecha: string;
  hora_ini: string;
  hora_fin: string;
};

export function horaAMinutos(hhmm: string): number | null {
  const m = String(hhmm)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function minutosAHora(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function diferenciaHorasDecimal(
  horaIni: string,
  horaFin: string,
): number {
  const a = horaAMinutos(horaIni);
  const b = horaAMinutos(horaFin);
  if (a == null || b == null) return Number.NaN;
  return (b - a) / 60;
}

export function horasCoinciden(
  horaIni: string,
  horaFin: string,
  tramos: Array<{ hora_ini: string; hora_fin: string }>,
): boolean {
  const ausentismo = diferenciaHorasDecimal(horaIni, horaFin);
  if (!Number.isFinite(ausentismo)) return false;
  const recuperar = tramos.reduce((acc, row) => {
    const d = diferenciaHorasDecimal(row.hora_ini, row.hora_fin);
    return acc + (Number.isFinite(d) ? d : 0);
  }, 0);
  return ausentismo.toFixed(2) === recuperar.toFixed(2);
}

export function esMotivoRecuperacion(motivo: string): boolean {
  return (MOTIVOS_RECUPERACION_AUSENTISMO as readonly string[]).includes(
    motivo,
  );
}

export function rangosHoraSeCruzan(
  aIni: string,
  aFin: string,
  bIni: string,
  bFin: string,
): boolean {
  const a0 = horaAMinutos(aIni);
  const a1 = horaAMinutos(aFin);
  const b0 = horaAMinutos(bIni);
  const b1 = horaAMinutos(bFin);
  if (a0 == null || a1 == null || b0 == null || b1 == null) return false;
  return (
    (a0 >= b0 && a0 < b1) || (a1 > b0 && a1 <= b1) || (a0 <= b0 && a1 >= b1)
  );
}

export function hayCruceTramosMismoDia(tramos: TramoRecuperacion[]): boolean {
  for (let i = 0; i < tramos.length; i++) {
    for (let j = i + 1; j < tramos.length; j++) {
      if (tramos[i].fecha !== tramos[j].fecha) continue;
      if (
        rangosHoraSeCruzan(
          tramos[i].hora_ini,
          tramos[i].hora_fin,
          tramos[j].hora_ini,
          tramos[j].hora_fin,
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

export function horaEnRango(
  hhmm: string,
  minHHmm: string,
  maxHHmm: string,
  intervalo = INTERVALO_MINUTOS_HORA,
): boolean {
  const t = horaAMinutos(hhmm);
  const from = horaAMinutos(minHHmm);
  const to = horaAMinutos(maxHHmm);
  if (t == null || from == null || to == null) return false;
  if (t < from || t > to) return false;
  return (t - from) % intervalo === 0;
}

export function minToHorasTexto(min: number): string {
  const horas = Math.floor(min / 60);
  const minutos = Math.abs(min % 60);
  const mm = minutos <= 9 ? `0${minutos}` : String(minutos);
  return `${horas} Horas con ${mm} Minutos`;
}
