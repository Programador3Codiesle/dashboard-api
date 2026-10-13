import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { IInformeLeadsRepository } from '../../domain/informe-leads.repository';
import { exigirRangoFechas } from '../rango-fechas-leads';

@Injectable()
export class ExportarInformeLeadsExcelUseCase {
  constructor(private readonly repo: IInformeLeadsRepository) {}

  async execute(desde: string, hasta: string): Promise<Buffer> {
    exigirRangoFechas(desde, hasta);
    const items = await this.repo.listarRango(desde, hasta);

    const wb = new Workbook();
    const ws = wb.addWorksheet('Informe Leads', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    ws.addRow([
      'Fecha registro',
      'Nombres',
      'Placa',
      'Teléfonos',
      'Email',
      'Campaña',
      'Motivo',
      'Id cita',
    ]);
    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FF1F2937' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' },
    };

    for (const item of items) {
      ws.addRow([
        item.fechaRegistro,
        item.nombres ?? '',
        item.placa ?? '',
        item.telefonos ?? '',
        item.email ?? '',
        item.campana ?? '',
        item.motivo ?? '',
        item.idCita ?? '',
      ]);
    }

    ws.columns.forEach((col) => {
      if (!col || typeof col.eachCell !== 'function') return;
      let max = 12;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const raw = cell.value;
        const text = raw == null || typeof raw === 'object' ? '' : String(raw);
        if (text.length > max) max = Math.min(text.length, 48);
      });
      col.width = max + 2;
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
