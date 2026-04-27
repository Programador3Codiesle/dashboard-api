import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
} from '../../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class ExportarPacNpsDetalleTecnicoExcelUseCase {
  constructor(private readonly repo: IPacNpsInternoDetalladoRepository) {}

  async execute(
    nombreTecnico: string,
    filtros: FiltrosPacNpsInterno,
    fechaParam: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    if (!filtros.anio || !filtros.mes) {
      throw new BadRequestException('Debe seleccionar año y mes válidos.');
    }
    if (!nombreTecnico?.trim()) {
      throw new BadRequestException('El nombre del técnico es obligatorio.');
    }

    const rows = await this.repo.filasExportDetalleTecnico(
      nombreTecnico,
      filtros,
    );

    const wb = new Workbook();
    const ws = wb.addWorksheet('Detalle técnico', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const headers = [
      'N° Orden',
      'Cliente',
      'Placa',
      'Marca',
      'Familia',
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
        r.numero,
        r.nombre ?? '',
        r.placa ?? '',
        r.marca ?? '',
        r.familia ?? '',
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
    const safe =
      nombreTecnico.replace(/[^A-Za-z0-9_\-]/g, '_').trim() || 'Detalle_NPS';
    const fechaCompacta = fechaParam.replace(/-/g, '');
    const filename = `${safe}_${fechaCompacta}.xlsx`;

    return { buffer, filename };
  }
}
