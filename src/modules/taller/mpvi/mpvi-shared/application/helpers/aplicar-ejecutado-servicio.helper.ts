import type { IMpviCotizacionRepository } from '../../domain/mpvi-cotizacion.repository';

/**
 * Port de MPVI.php::_aplicarEjecutadoServicioMpvi
 */
export async function aplicarEjecutadoServicioMpvi(
  repo: IMpviCotizacionRepository,
  idCotizacion: number,
  subsistemas: string[],
  operaciones: string[],
  repuestos: string[],
  disponibilidad: string[],
  autorizaciones: string[],
  valoresInicialesDisp: string[],
  op: number,
): Promise<void> {
  const nFilas = Math.max(
    subsistemas.length,
    operaciones.length,
    repuestos.length,
  );

  for (let i = 0; i < nFilas; i++) {
    const codOp = operaciones[i] ?? '';
    if (codOp === '') continue;

    const sub = Number(subsistemas[i] ?? 0);
    const aut = Number(autorizaciones[i] ?? 0);
    const disp = disponibilidad[i] ?? '1';
    const dispIni = valoresInicialesDisp[i] ?? '1';
    let ejecutado = disp === '1' && aut === 1 ? 1 : 0;
    if (op !== 1) ejecutado = 0;
    const opFecha = dispIni === '0' && disp === '1';

    await repo.actualizarCotizacionMpviDetalladaEjecutada(
      idCotizacion,
      sub,
      codOp,
      disp,
      opFecha ? true : null,
      ejecutado,
    );
  }

  for (let i = 0; i < nFilas; i++) {
    const codRep = repuestos[i] ?? '';
    if (codRep === '') continue;

    const sub = Number(subsistemas[i] ?? 0);
    const aut = Number(autorizaciones[i] ?? 0);
    const disp = disponibilidad[i] ?? '1';
    const dispIni = valoresInicialesDisp[i] ?? '1';
    let ejecutado = disp === '1' && aut === 1 ? 1 : 0;
    if (op !== 1) ejecutado = 0;
    const opFecha = dispIni === '0' && disp === '1';

    await repo.actualizarCotizacionMpviDetalladaEjecutada(
      idCotizacion,
      sub,
      codRep,
      disp,
      opFecha ? true : null,
      ejecutado,
    );
  }
}
