import { ForbiddenException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ListarComprasUseCase } from './listar-compras.usecase';
import { FiltrosComprasDto } from '../dto/filtros-compras.dto';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { SesionListarCompras, veTodasLasCompras } from '../visibilidad-compras';

const ESTADO_COMPRA: Record<number, string> = {
  1: 'Sin Revisar',
  2: 'En Proceso',
  3: 'En transito',
  4: 'Despachada',
  5: 'Negada',
};

const ESTADO_AUTORIZACION: Record<number, string> = {
  1: 'Sin autorización',
  2: 'Pendiente de autorización',
  3: 'Autorizado',
  4: 'No autorizado',
};

@Injectable()
export class ExportarComprasExcelUseCase {
  constructor(
    private readonly listarComprasUC: ListarComprasUseCase,
    private readonly repo: IGestionCompraRepository,
  ) {}

  async execute(
    filtros: FiltrosComprasDto | undefined,
    sesion: SesionListarCompras,
  ): Promise<Buffer> {
    if (!veTodasLasCompras(sesion.perfil)) {
      throw new ForbiddenException(
        'No tiene permiso para descargar el listado de compras',
      );
    }
    const estado =
      filtros?.estado != null && filtros.estado > 0
        ? filtros.estado
        : undefined;
    const { items } = await this.listarComprasUC.execute(
      {
        pagina: 1,
        limite: 50000,
        estado,
      },
      sesion,
    );

    const wb = new Workbook();
    const ws = wb.addWorksheet('Gestión de compras', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const ids = (items as Array<{ id_solicitud?: string }>)
      .map((item) =>
        item.id_solicitud != null ? BigInt(item.id_solicitud) : null,
      )
      .filter((id): id is bigint => id != null);
    const mensajes = await this.repo.listarMensajesExcel(ids);
    const textoPorSolicitud = new Map<string, string[]>();
    for (const mensaje of mensajes) {
      const key = mensaje.solicitud_compra.toString();
      const lineas = textoPorSolicitud.get(key) ?? [];
      lineas.push(`${mensaje.nombres}: ${mensaje.mensaje}`);
      textoPorSolicitud.set(key, lineas);
    }

    const headerRow = [
      '#',
      'Descripción',
      'Mensajes',
      'Con Factura',
      'Estado',
      'Estado Autorización',
      'Usuario que Solicita',
      'Gerente que Autoriza',
      'Fecha de solicitud',
      'Fecha de autorizacion',
      'Dias en Gestion',
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

    for (const item of items as Array<{
      id_solicitud?: string;
      descri_prod?: string;
      con_factura?: string | null;
      estado?: number;
      estado_autorizacion?: number;
      usuario_reg?: string | null;
      gerente?: string | null;
      fecha_solicitud?: string;
      fecha_autorizacion?: string | null;
      dias_gest?: number;
    }>) {
      const id = item.id_solicitud ?? '';
      ws.addRow([
        id,
        item.descri_prod ?? '',
        (textoPorSolicitud.get(id) ?? []).join('\n'),
        item.con_factura ?? '',
        ESTADO_COMPRA[item.estado ?? 0] ?? '',
        ESTADO_AUTORIZACION[item.estado_autorizacion ?? 0] ?? '',
        item.usuario_reg ?? '',
        item.gerente ?? '',
        item.fecha_solicitud ?? '',
        item.fecha_autorizacion ?? '',
        item.dias_gest ?? 0,
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
