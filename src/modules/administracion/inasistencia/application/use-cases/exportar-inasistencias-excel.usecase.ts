import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ListarInasistenciasUseCase } from './listar-inasistencias.usecase';
import { FiltrosInasistenciaDto } from '../dto/filtros-inasistencia.dto';

@Injectable()
export class ExportarInasistenciasExcelUseCase {
  constructor(
    private readonly listarInasistenciasUC: ListarInasistenciasUseCase,
  ) {}

  async execute(filtros?: FiltrosInasistenciaDto): Promise<Buffer> {
    const items = await this.listarInasistenciasUC.execute(filtros);
    const list = Array.isArray(items) ? items : ((items as any)?.items ?? []);

    const wb = new Workbook();
    const ws = wb.addWorksheet('Inasistencias', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    ws.addRow(['Documento', 'Nombre', 'Fecha']);
    const header = ws.getRow(1);
    header.font = { bold: true };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const item of list) {
      const fecha =
        item.fecha instanceof Date
          ? item.fecha.toLocaleDateString('sv-SE', {
              timeZone: 'America/Bogota',
            })
          : (item.fecha ?? '');
      ws.addRow([item.documento ?? '', item.nombre ?? '', fecha]);
    }

    ws.getColumn(1).width = 14;
    ws.getColumn(2).width = 40;
    ws.getColumn(3).width = 12;

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
