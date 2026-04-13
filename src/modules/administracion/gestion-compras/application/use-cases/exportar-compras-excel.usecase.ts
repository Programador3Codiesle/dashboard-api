import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ListarComprasUseCase } from './listar-compras.usecase';
import { FiltrosComprasDto } from '../dto/filtros-compras.dto';

@Injectable()
export class ExportarComprasExcelUseCase {
  constructor(private readonly listarComprasUC: ListarComprasUseCase) {}

  async execute(filtros?: FiltrosComprasDto): Promise<Buffer> {
    const { items } = await this.listarComprasUC.execute({
      ...filtros,
      pagina: 1,
      limite: 50000,
    });

    const wb = new Workbook();
    const ws = wb.addWorksheet('Gestión de compras', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const headerRow = [
      'ID',
      'Fecha solicitud',
      'Área',
      'Sede',
      'NIT solicitante',
      'Cargo',
      'Gerente autoriza',
      'Descripción producto',
      'Características',
      'Proveedor',
      'Área cargar',
      'Urgencia',
      'Fecha tentativa',
      'Estado',
      'Fecha autorización',
      'Estado autorización',
      'Con factura',
    ];
    ws.addRow(headerRow);
    const header = ws.getRow(1);
    header.font = { bold: true };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const item of items as any[]) {
      ws.addRow([
        item.id_solicitud ?? '',
        item.fecha_solicitud ?? '',
        item.area ?? '',
        item.sede ?? '',
        item.usu_solicita ?? '',
        item.cargo_usu_solicita ?? '',
        item.gerente ?? item.gerente_autoriza ?? '',
        item.descri_prod ?? '',
        item.caracteristicas ?? '',
        item.proveedor ?? '',
        item.area_cargar ?? '',
        item.urgencia ?? '',
        item.fecha_tentativa ?? '',
        item.estado ?? '',
        item.fecha_autorizacion ?? '',
        item.estado_autorizacion ?? '',
        item.con_factura ?? '',
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

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
