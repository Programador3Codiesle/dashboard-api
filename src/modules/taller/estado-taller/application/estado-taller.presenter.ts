import type {
  OrdenTallerAbiertaEntity,
  OrdenTallerAbiertaRowEntity,
} from '../domain/estado-taller.entity';

const ESTADOS_ESPERA = new Set([
  'EN ESPERA DE  RTOS G.M.',
  'EN ESPERA POR ASIGNACION DE MO',
  'EN ESPERA DE RPTOS G.M.',
  'EN ESPERA AUTORIZACIÓN',
  'EN ESPERA DIAGNÓSTICO',
]);

const RAZON2_LABELS: Record<number, string> = {
  1: 'Colisión Leve',
  2: 'Colisión Media',
  3: 'Colisión Fuerte',
  4: 'Mecanica Rapida',
  5: 'Mecanica Especializada',
  6: 'Accesorios',
  7: 'Garantia G.M.C',
  8: 'Alistamiento y Peritaje',
  9: 'Retorno',
  10: 'Interno',
};

export function labelRazon2(razon2: number | null): string {
  if (razon2 == null) return '';
  return RAZON2_LABELS[razon2] ?? String(razon2);
}

export function labelMesFactura(mesFactEst: number | null): string {
  if (mesFactEst === 0) return 'NO';
  if (mesFactEst === 1) return 'SI';
  return '--';
}

function rowToneFromDiff(
  razon2: number | null,
  diff: number | null,
): 'danger' | 'warning' | 'success' | null {
  if (diff == null || diff <= 0 || razon2 == null) return null;

  if (razon2 === 1) {
    if (diff <= 3) return 'danger';
    if (diff <= 6) return 'warning';
    if (diff <= 7) return 'success';
  } else if (razon2 === 2) {
    if (diff <= 4) return 'danger';
    if (diff <= 8) return 'warning';
    if (diff <= 10) return 'success';
  } else if (razon2 === 3) {
    if (diff <= 6) return 'danger';
    if (diff <= 11) return 'warning';
    if (diff <= 16) return 'success';
  }
  return null;
}

export function enrichOrdenRow(
  base: OrdenTallerAbiertaRowEntity,
  diffDias: number | null,
  cotizacionesSacyr: number[],
): OrdenTallerAbiertaEntity {
  return {
    ...base,
    razon2Label: labelRazon2(base.razon2),
    mesFacturaActual: labelMesFactura(base.mesFactEst),
    diffDiasPromesa: diffDias,
    rowTone: rowToneFromDiff(base.razon2, diffDias),
    borderEspera: ESTADOS_ESPERA.has(base.estado),
    cotizacionesSacyr,
  };
}
