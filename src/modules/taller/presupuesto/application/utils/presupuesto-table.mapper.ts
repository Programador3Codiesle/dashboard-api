import { MESES_PRESUPUESTO } from '../../domain/constants/meses.constants';
import {
  FilaTablaPresupuestoEntity,
  FiltrosPresupuestoEntity,
  MatrizFila,
  TablaPresupuestoEntity,
} from '../../domain/entities/presupuesto.entity';

export function mapMatrizToTabla(
  titulo: string,
  matriz: MatrizFila[],
  filtros: FiltrosPresupuestoEntity,
  editable: boolean,
  puedeEditar: boolean,
): TablaPresupuestoEntity {
  const mostrarEdicion = editable && puedeEditar;
  const tipoId = filtros.tipoId ?? 0;

  const filas: FilaTablaPresupuestoEntity[] = matriz.map((fila) => {
    const etiqueta = String(fila.Mes);
    const presupuesto = fila.Presupuesto;
    const celdas: Record<string, number | string | null> = {};

    for (const mes of MESES_PRESUPUESTO) {
      celdas[mes] = fila[mes] ?? null;
    }

    const esFilaMes = (MESES_PRESUPUESTO as readonly string[]).includes(
      etiqueta,
    );

    let celdaPresupuestoEditable:
      | FilaTablaPresupuestoEntity['celdaPresupuestoEditable']
      | undefined;
    let celdaSaldoEditable:
      | FilaTablaPresupuestoEntity['celdaSaldoEditable']
      | undefined;

    if (mostrarEdicion && esFilaMes) {
      const mesIndex = MESES_PRESUPUESTO.indexOf(
        etiqueta as (typeof MESES_PRESUPUESTO)[number],
      );
      const mesNum = mesIndex + 1;

      celdaPresupuestoEditable = {
        mes: mesNum,
        mesLabel: etiqueta,
        anio: filtros.anio,
        sedeId: filtros.sedeId,
        tipoId,
        tipoVh: filtros.tipoVh,
      };

      celdaSaldoEditable = {
        mes: mesNum,
        mesLabel: etiqueta,
        anio: filtros.anio,
        sedeId: filtros.sedeId,
        tipoId,
        tipoVh: filtros.tipoVh,
      };
    }

    return {
      etiqueta,
      presupuesto,
      celdas,
      celdaPresupuestoEditable,
      celdaSaldoEditable,
    };
  });

  return {
    titulo,
    editable,
    filtros,
    filas,
  };
}
