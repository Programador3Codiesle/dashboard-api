import { MESES_PRESUPUESTO } from '../../domain/constants/meses.constants';
import {
  MatrizFila,
  PresupuestoMesRawEntity,
} from '../../domain/entities/presupuesto.entity';

function formatPorcentaje(valor: number): string {
  return `${valor.toFixed(1).replace('.', ',')} %`;
}

export function normalizarDatosMensuales(
  datos: PresupuestoMesRawEntity[],
): PresupuestoMesRawEntity[] {
  const porMes = new Map<number, PresupuestoMesRawEntity>();
  for (const d of datos) {
    porMes.set(d.mes, {
      mes: d.mes,
      presupuesto: Number(d.presupuesto) || 0,
      saldo: Number(d.saldo) || 0,
    });
  }

  return MESES_PRESUPUESTO.map((_, i) => {
    const mes = i + 1;
    return (
      porMes.get(mes) ?? {
        mes,
        presupuesto: 0,
        saldo: 0,
      }
    );
  });
}

export function generateTable(datos: PresupuestoMesRawEntity[]): MatrizFila[] {
  const normalizados = normalizarDatosMensuales(datos);
  const matriz: MatrizFila[] = [];
  let totalPresupuesto = 0;

  const cumplimientoMes: MatrizFila = {
    Mes: 'Cumplimiento Mes',
    Presupuesto: '',
  };
  const cumplimientoAcumulado: MatrizFila = {
    Mes: 'Cumplimiento acumulado',
    Presupuesto: '',
  };

  let saldoAcumulado = 0;
  let presupuestoAcumulado = 0;

  for (let i = 0; i < normalizados.length; i++) {
    const dato = normalizados[i];
    const fila: MatrizFila = {
      Mes: MESES_PRESUPUESTO[i],
      Presupuesto: dato.presupuesto,
    };

    totalPresupuesto += dato.presupuesto;

    for (let j = 0; j < MESES_PRESUPUESTO.length; j++) {
      const mes = MESES_PRESUPUESTO[j];
      fila[mes] = j === i ? dato.saldo : null;

      if (j === i) {
        const saldo = dato.saldo ?? 0;
        const presupuesto = dato.presupuesto ?? 0;

        saldoAcumulado += saldo;
        presupuestoAcumulado += presupuesto;

        const cumplimientoMesPorc =
          presupuesto > 0
            ? formatPorcentaje((saldo / presupuesto) * 100)
            : '0 %';

        const cumplimientoAcuMesPorc =
          presupuestoAcumulado > 0
            ? formatPorcentaje((saldoAcumulado / presupuestoAcumulado) * 100)
            : '0 %';

        cumplimientoMes[mes] = cumplimientoMesPorc;
        cumplimientoAcumulado[mes] = cumplimientoAcuMesPorc;
      }
    }

    matriz.push(fila);
  }

  const filaTotal: MatrizFila = {
    Mes: 'Total',
    Presupuesto: totalPresupuesto,
  };
  for (const mes of MESES_PRESUPUESTO) {
    filaTotal[mes] = null;
  }
  matriz.push(filaTotal);

  const conLoad3 = loadData3(matriz);
  const conLoad4 = loadData4(conLoad3);

  conLoad4.push(cumplimientoMes);
  conLoad4.push(cumplimientoAcumulado);

  return conLoad4;
}

export function loadData3(datos: MatrizFila[]): MatrizFila[] {
  const resultado = datos.map((fila) => ({ ...fila }));

  for (let i = 1; i < resultado.length; i++) {
    const mesAnterior = MESES_PRESUPUESTO[i - 1];
    const saldoAnterior = resultado[i - 1][mesAnterior] as number | null;
    const presupuestoAnterior = resultado[i - 1].Presupuesto as number;
    resultado[i][mesAnterior] = (saldoAnterior ?? 0) - presupuestoAnterior;
  }

  return resultado;
}

export function loadData4(datos: MatrizFila[]): MatrizFila[] {
  const resultado = datos.map((fila) => ({ ...fila }));

  for (let i = 0; i < resultado.length - 2; i++) {
    const mesActual = MESES_PRESUPUESTO[i];
    const mesSiguiente = MESES_PRESUPUESTO[i + 1];

    if (i === 0) {
      const a = (resultado[i + 1][mesActual] as number) ?? 0;
      const b = (resultado[i + 2][mesSiguiente] as number) ?? 0;
      resultado[i][mesSiguiente] = a + b;
    } else {
      const a = (resultado[i - 1][mesActual] as number) ?? 0;
      const b = (resultado[i + 2][mesSiguiente] as number) ?? 0;
      resultado[i][mesSiguiente] = a + b;
    }
  }

  return resultado;
}
