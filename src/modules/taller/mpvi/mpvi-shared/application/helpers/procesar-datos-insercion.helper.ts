import type {
  CotizacionDetalleInsert,
  ValorManoObraRow,
  ValorRepuestoRow,
} from '../../domain/mpvi-cotizacion.repository';

export interface ProcesarDatosInsercionResult {
  manoObra: CotizacionDetalleInsert[];
  repuestos: CotizacionDetalleInsert[];
  totalCotizacion: number;
  totalAutorizado: number;
  indiceDisponibilidad: number;
}

/**
 * Port de MPVI.php::procesarDatosInsercion
 */
export function procesarDatosInsercion(
  manoObra: ValorManoObraRow[],
  repuestos: ValorRepuestoRow[],
  cobrables: number[],
  disponibilidad: string[],
  autorizados: number[],
  idUser: number,
  op: number,
  j: number,
): ProcesarDatosInsercionResult {
  const sufijo = op === 0 ? 'U' : 'R';
  let i = j;
  let totalManoObra = 0;
  let totalAutorizado = 0;

  const cobrablesNorm = cobrables.map((id) => Number(id));
  const autorizadosNorm = autorizados.map((id) => Number(id));

  const arrManoObra: CotizacionDetalleInsert[] = [];
  for (const row of manoObra) {
    const idSubsistema = Number(row.id_subsistema);
    const autorizado = autorizadosNorm.includes(idSubsistema) ? 1 : 0;
    const disp = disponibilidad[i] ?? '1';
    const manoObraValor = cobrablesNorm.includes(idSubsistema) ? 0 : row.total;

    arrManoObra.push({
      id_subsistema: idSubsistema,
      operacion: row.operacion,
      tipo: 'T',
      tipo_item: sufijo,
      cantidadTiempo: row.tiempo,
      autorizado,
      usuario_auth: idUser,
      disponible: disp,
      valor: manoObraValor,
    });

    totalManoObra += manoObraValor;
    if (autorizado === 1) {
      totalAutorizado += manoObraValor;
    }
    i++;
  }

  let totalRepuestos = 0;
  const arrRepuestos: CotizacionDetalleInsert[] = [];
  for (const row of repuestos) {
    const idSubsistema = Number(row.id_subsistema);
    const autorizado = autorizadosNorm.includes(idSubsistema) ? 1 : 0;
    const disp = disponibilidad[j] ?? '1';
    const valor = row.total;

    arrRepuestos.push({
      id_subsistema: idSubsistema,
      operacion: row.codigo,
      tipo: 'R',
      tipo_item: sufijo,
      cantidadTiempo: row.cantidad,
      autorizado,
      usuario_auth: idUser,
      disponible: disp,
      valor,
    });

    totalRepuestos += valor;
    if (autorizado === 1) {
      totalAutorizado += valor;
    }
    j++;
  }

  return {
    manoObra: arrManoObra,
    repuestos: arrRepuestos,
    totalCotizacion: totalManoObra + totalRepuestos,
    totalAutorizado,
    indiceDisponibilidad: j,
  };
}
