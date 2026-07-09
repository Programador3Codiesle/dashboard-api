import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  SolicitudEvDetalleRow,
  SolicitudEvRow,
} from '../domain/entradas-varias.repository';

@Injectable()
export class GenerarFormatoEntregaPdfService {
  async generar(
    solicitud: SolicitudEvRow,
    detalle: SolicitudEvDetalleRow[],
    salida: { numeroSv: number; tipoSv: string; numeroOSv: number },
  ): Promise<Buffer> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    page.drawText('Formato Entrega de Repuestos', {
      x: 40,
      y,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 28;
    page.drawText(`Solicitud #${solicitud.id} | Orden ${solicitud.n_orden}`, {
      x: 40,
      y,
      size: 11,
      font,
    });
    y -= 18;
    page.drawText(
      `Salida: ${salida.tipoSv}-${salida.numeroSv} | OT SV: ${salida.numeroOSv}`,
      { x: 40, y, size: 11, font },
    );
    y -= 24;

    for (const row of detalle) {
      if (y < 80) break;
      page.drawText(
        `${row.referencia} - ${row.descripcion} (Cant: ${row.cantidad})`,
        { x: 40, y, size: 10, font },
      );
      y -= 14;
    }

    const bytes = await pdf.save();
    return Buffer.from(bytes);
  }
}
