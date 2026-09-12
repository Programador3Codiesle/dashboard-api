import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ListarTiempoSuplementarioUseCase } from './listar-tiempo-suplementario.usecase';
import { FiltrosTiempoSuplementarioDto } from '../dto/filtros-tiempo-suplementario.dto';
import type { SesionInformeHe } from '../../domain/informe-tiempo-suplementario.repository';
import type { InformeTiempoSuplementarioEntity } from '../../domain/informe-tiempo-suplementario.entity';

const ESTADOS: Record<number, string> = {
  0: 'Pendiente',
  1: 'Aprobado',
  2: 'Negado',
};

@Injectable()
export class ExportarTiempoSuplementarioExcelUseCase {
  constructor(
    private readonly listarTiempoUC: ListarTiempoSuplementarioUseCase,
  ) {}

  async execute(
    filtros: FiltrosTiempoSuplementarioDto | undefined,
    sesion: SesionInformeHe,
  ): Promise<Buffer> {
    const items = await this.listarTiempoUC.execute(filtros, sesion);
    const list: InformeTiempoSuplementarioEntity[] = Array.isArray(items)
      ? items
      : [];

    const wb = new Workbook();
    const ws = wb.addWorksheet('Tiempo suplementario', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const headerRow = [
      'Nombre del Empleado',
      'Sede',
      'Área',
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Descripción',
      'Estado',
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

    for (const item of list) {
      const fecha =
        item.fecha instanceof Date
          ? item.fecha.toLocaleDateString('sv-SE', {
              timeZone: 'America/Bogota',
            })
          : (item.fecha ?? '');
      ws.addRow([
        item.nombre_empleado ?? '',
        item.sede ?? '',
        item.area ?? '',
        fecha,
        item.hora_ini ?? '',
        item.hora_fin ?? '',
        item.descripcion ?? '',
        item.estado !== null && item.estado !== undefined
          ? (ESTADOS[item.estado] ?? 'Pendiente')
          : '',
      ]);
    }

    ws.columns.forEach((col) => {
      if (col && typeof col.eachCell === 'function') {
        let max = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const raw = cell.value;
          const text =
            raw == null || typeof raw === 'object' ? '' : String(raw);
          const len = text.length;
          if (len > max) max = Math.min(len, 50);
        });
        col.width = max;
      }
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
