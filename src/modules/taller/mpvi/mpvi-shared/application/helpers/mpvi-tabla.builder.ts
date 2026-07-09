import type {
  ValorManoObraPdfRow,
  ValorManoObraRow,
  ValorRepuestoPdfRow,
  ValorRepuestoRow,
} from '../../domain/mpvi-cotizacion.repository';
import type {
  MpviTablaServicio,
  MpviTablaServicioFila,
  MpviTablaTecnico,
  MpviTablaTecnicoFila,
} from './mpvi.types';

function parseCobrables(cobrables: number[]): Set<number> {
  return new Set(cobrables.map((id) => Number(id)));
}

function toNum(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sameSubsistema(a: unknown, b: unknown): boolean {
  return Number(a) === Number(b);
}

function subsistemaId(value: unknown): number {
  return Number(value);
}

/**
 * Port de MPVI.php::generarTablas — datos estructurados (sin HTML).
 */
export function buildTablaCotizacionTecnico(
  manoObra: ValorManoObraRow[],
  repuestosIn: ValorRepuestoRow[],
  cobrables: number[],
  tipo: 'U' | 'R',
): MpviTablaTecnico {
  const cobrableSet = parseCobrables(cobrables);
  const repuestos = [...repuestosIn];
  const filas: MpviTablaTecnicoFila[] = [];
  let totalM = 0;
  let totalR = 0;

  for (const key of manoObra) {
    let codRepuesto = '';
    let repuesto = '';
    let cantRepuesto = 0;
    let dispRepuesto = 0;
    let valorRepuesto = 0;

    const manoObraValor = cobrableSet.has(subsistemaId(key.id_subsistema))
      ? 0
      : toNum(key.total);
    const indice = repuestos.findIndex((r) =>
      sameSubsistema(r.id_subsistema, key.id_subsistema),
    );

    if (indice >= 0) {
      const match = repuestos[indice];
      codRepuesto = match.codigo;
      repuesto = match.descripcion;
      cantRepuesto = toNum(match.cantidad);
      dispRepuesto = match.disp;
      valorRepuesto = toNum(match.total);
      repuestos.splice(indice, 1);
    }

    filas.push({
      idSubsistema: subsistemaId(key.id_subsistema),
      descripcion: key.descripcion,
      tiempo: toNum(key.tiempo),
      codRepuesto,
      repuesto,
      cantidad: cantRepuesto,
      disponible: dispRepuesto,
      valorRepuesto,
      manoObra: manoObraValor,
      autorizadoDefault: true,
      noDisponibleDefault: false,
      sufijo: tipo,
    });

    totalM += manoObraValor;
    totalR += valorRepuesto;
  }

  for (const row of repuestos) {
    filas.push({
      idSubsistema: subsistemaId(row.id_subsistema),
      descripcion: '',
      tiempo: 0,
      codRepuesto: row.codigo,
      repuesto: row.descripcion,
      cantidad: toNum(row.cantidad),
      disponible: row.disp,
      valorRepuesto: toNum(row.total),
      manoObra: 0,
      autorizadoDefault: true,
      noDisponibleDefault: false,
      sufijo: tipo,
    });
    totalR += toNum(row.total);
  }

  const etiqueta = tipo === 'U' ? 'URGENTE' : 'RECOMENDADO';

  return {
    filas,
    totales: {
      repuestos: totalR,
      manoObra: totalM,
      neto: totalM + totalR,
    },
    etiqueta,
  };
}

function disponibleBool(val: string | number): boolean {
  return String(val) !== '0';
}

/** SQL Server bit puede llegar como 1/0, boolean o bigint desde $queryRaw. */
function isAutorizado(value: unknown): boolean {
  return value === true || Number(value) === 1;
}

/**
 * Port de MPVImodel::generar_tablas_pdf — datos estructurados para gestión servicio.
 */
export function buildTablaServicio(
  manoObra: ValorManoObraPdfRow[],
  repuestosIn: ValorRepuestoPdfRow[],
  tipo: 'U' | 'R',
): MpviTablaServicio {
  const repuestos = repuestosIn.map((r) => ({ ...r }));
  const filas: MpviTablaServicioFila[] = [];
  let totalM = 0;
  let totalR = 0;

  for (const key of manoObra) {
    let codRepuesto = 'N/A';
    let repuesto = 'N/A';
    let cantRepuesto = 0;
    let valorRepuesto = 0;
    let autorizaRepuesto = 0;
    let dispRepuesto = false;

    const indice = repuestos.findIndex((r) =>
      sameSubsistema(r.id_subsistema, key.id_subsistema),
    );

    if (indice >= 0) {
      const match = repuestos[indice];
      codRepuesto = match.codigo;
      repuesto = match.descripcion;
      cantRepuesto = toNum(match.cantidad);
      valorRepuesto = toNum(match.valor);
      autorizaRepuesto = isAutorizado(match.autorizado) ? 1 : 0;
      dispRepuesto = !disponibleBool(match.disponible);
      repuestos.splice(indice, 1);
    }

    filas.push({
      idSubsistema: subsistemaId(key.id_subsistema),
      operacion: key.operacion,
      descripcion: key.descripcion,
      tiempo: toNum(key.tiempo),
      codRepuesto,
      repuesto,
      cantidad: cantRepuesto,
      disponible: disponibleBool(key.disponible),
      valorRepuesto,
      manoObra: toNum(key.valor),
      autorizado: isAutorizado(key.autorizado),
      noDisponible: !disponibleBool(key.disponible),
      sufijo: tipo,
    });

    if (isAutorizado(key.autorizado)) totalM += toNum(key.valor);
    if (autorizaRepuesto === 1) totalR += valorRepuesto;
  }

  for (const row of repuestos) {
    filas.push({
      idSubsistema: subsistemaId(row.id_subsistema),
      operacion: '',
      descripcion: '',
      tiempo: 0,
      codRepuesto: row.codigo,
      repuesto: row.descripcion,
      cantidad: toNum(row.cantidad),
      disponible: disponibleBool(row.disponible),
      valorRepuesto: toNum(row.valor),
      manoObra: 0,
      autorizado: isAutorizado(row.autorizado),
      noDisponible: !disponibleBool(row.disponible),
      sufijo: tipo,
    });
    if (isAutorizado(row.autorizado)) totalR += toNum(row.valor);
  }

  const etiqueta = tipo === 'U' ? 'URGENTE' : 'RECOMENDADO';

  return {
    filas,
    totales: {
      repuestos: totalR,
      manoObra: totalM,
      neto: totalM + totalR,
    },
    etiqueta,
  };
}
