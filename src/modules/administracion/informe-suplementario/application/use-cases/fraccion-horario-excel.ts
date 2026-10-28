import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';

/** Recargo nocturno: desde las 19:00 inclusive hasta las 06:00 exclusive. */
const DIA = 24 * 60;
const INICIO_DIA = 6 * 60;
const INICIO_NOCHE = 19 * 60;

export type HorarioExcel = {
  horaInicio: string;
  horaSalida: string;
  horaInicioNocturna: string;
  horaSalidaNocturna: string;
};

type Tramo = {
  start: number;
  end: number;
  /** El tramo se cortó en un límite (19:00 o 06:00), no en la hora de salida real. */
  corte: boolean;
};

/**
 * Parte el turno solo para el Excel.
 * 17:00–21:00 queda 17:00 / 18:59 y nocturna 19:00 / 21:00.
 * Si el turno sigue después de las 06:00, la nocturna cierra en 05:59 y el día retoma a las 06:00.
 */
export function fraccionarHorarioExcel(
  horaIni: unknown,
  horaFin: unknown,
): HorarioExcel {
  const inicioTxt = horaMilitarExcel(horaIni);
  const finTxt = horaMilitarExcel(horaFin);
  const inicio = aMinutos(inicioTxt);
  const fin = aMinutos(finTxt);

  if (inicio == null || fin == null || inicio === fin) {
    const nocturna = inicio != null && esNocturna(inicio);
    return {
      horaInicio: nocturna ? '' : inicioTxt,
      horaSalida: nocturna ? '' : finTxt,
      horaInicioNocturna: nocturna ? inicioTxt : '',
      horaSalidaNocturna: nocturna ? finTxt : '',
    };
  }

  let finAbs = fin;
  if (finAbs <= inicio) finAbs += DIA;

  const dias = tramos(inicio, finAbs, ventanasDia());
  const noches = tramos(inicio, finAbs, ventanasNoche());
  const dia = elegirDia(dias);
  const noche = elegirNoche(noches);

  return {
    horaInicio: dia ? minutosAHora(dia.start) : '',
    horaSalida: dia ? etiquetaFin(dia) : '',
    horaInicioNocturna: noche ? minutosAHora(noche.start) : '',
    horaSalidaNocturna: noche ? etiquetaFin(noche) : '',
  };
}

/** `HH:mm` de 24 h. Acepta `HH:mm:ss.fff`, 12 h y el texto de un Date. */
export function horaMilitarExcel(value: unknown): string {
  if (value == null || value === '') return '';
  if (value instanceof Date) return formatHoraHHmm(value);
  if (typeof value !== 'string' && typeof value !== 'number') return '';

  let raw = String(value).trim();
  raw = raw.replace(/^(\d{1,2}:\d{2}(?::\d{2})?)\.\d+$/, '$1');
  raw = raw
    .replace(/\s*a\s*\.?\s*m\.?$/i, ' AM')
    .replace(/\s*p\s*\.?\s*m\.?$/i, ' PM');

  const formatted = formatHoraHHmm(raw);
  if (/^\d{2}:\d{2}$/.test(formatted)) return formatted;

  const clock = raw.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (clock && /GMT|T\d{2}:\d{2}/.test(raw)) {
    return formatHoraHHmm(`${clock[1]}:${clock[2]}`);
  }

  return formatted;
}

function ventanasDia(): Array<[number, number]> {
  return [
    [INICIO_DIA, INICIO_NOCHE],
    [DIA + INICIO_DIA, DIA + INICIO_NOCHE],
  ];
}

function ventanasNoche(): Array<[number, number]> {
  return [
    [0, INICIO_DIA],
    [INICIO_NOCHE, DIA + INICIO_DIA],
    [DIA + INICIO_NOCHE, 2 * DIA + INICIO_DIA],
  ];
}

function tramos(
  inicio: number,
  fin: number,
  ventanas: Array<[number, number]>,
): Tramo[] {
  const out: Tramo[] = [];
  for (const [desde, hasta] of ventanas) {
    const start = Math.max(inicio, desde);
    const end = Math.min(fin, hasta);
    if (start >= end) continue;
    out.push({
      start,
      end,
      corte: end === hasta && fin > hasta,
    });
  }
  return out;
}

/** El tramo diurno que termina al entrar la noche, si existe. */
function elegirDia(tramosDia: Tramo[]): Tramo | undefined {
  return (
    tramosDia.find((tramo) => {
      const start = tramo.start % DIA;
      return tramo.corte && start >= INICIO_DIA && start < INICIO_NOCHE;
    }) ?? tramosDia[0]
  );
}

/** El recargo de las 19:00, si el turno lo cruza; si no, la madrugada. */
function elegirNoche(tramosNoche: Tramo[]): Tramo | undefined {
  return (
    tramosNoche.find((tramo) => tramo.start % DIA >= INICIO_NOCHE) ??
    tramosNoche[0]
  );
}

function etiquetaFin(tramo: Tramo): string {
  return minutosAHora(tramo.corte ? tramo.end - 1 : tramo.end);
}

function esNocturna(minutos: number): boolean {
  return minutos >= INICIO_NOCHE || minutos < INICIO_DIA;
}

function aMinutos(hhmm: string): number | null {
  const match = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutosAHora(total: number): string {
  const normalizado = ((total % DIA) + DIA) % DIA;
  const hours = Math.floor(normalizado / 60);
  const minutes = normalizado % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
