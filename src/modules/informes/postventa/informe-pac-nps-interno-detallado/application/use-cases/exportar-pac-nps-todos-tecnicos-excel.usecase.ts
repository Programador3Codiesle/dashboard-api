import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
} from '../../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class ExportarPacNpsTodosTecnicosExcelUseCase {
  constructor(private readonly repo: IPacNpsInternoDetalladoRepository) {}

  async execute(
    filtros: FiltrosPacNpsInterno,
    fechaParam: string,
    bodega?: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    if (!filtros.anio || !filtros.mes) {
      throw new BadRequestException('Debe seleccionar año y mes válidos.');
    }

    const rows = await this.repo.filasExportTodosTecnicos(filtros, bodega);

    const wb = new Workbook();
    const ws = wb.addWorksheet('Detalle técnicos', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const headers = [
      'Técnico',
      'N° Orden',
      'Cliente',
      'Placa',
      'Pregunta 1',
      'Pregunta 2',
      'Pregunta 3',
      'Pregunta 4',
      'Pregunta 5',
    ];
    ws.addRow(headers);
    const hr = ws.getRow(1);
    hr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hr.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    for (const r of rows) {
      ws.addRow([
        r.tecnico ?? '',
        r.numero,
        r.nombre ?? '',
        r.placa ?? '',
        r.pregunta1 ?? '',
        r.pregunta2 ?? '',
        r.pregunta3 ?? '',
        r.pregunta4 ?? '',
        r.pregunta5 ?? '',
      ]);
    }

    ws.columns.forEach((col) => {
      if (col && typeof col.eachCell === 'function') {
        let max = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = (cell.value?.toString() ?? '').length;
          if (len > max) max = Math.min(len, 50);
        });
        col.width = max;
      }
    });

    const buffer = Buffer.from(await wb.xlsx.writeBuffer());
    const fechaCompacta = fechaParam.replace(/-/g, '');
    const filename = `Detalle_NPS_Todos_${fechaCompacta}.xlsx`;

    return { buffer, filename };
  }
}
