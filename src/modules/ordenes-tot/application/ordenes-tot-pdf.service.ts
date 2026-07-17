import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import { TotReciboRow } from '../domain/ordenes-tot.repository';

@Injectable()
export class OrdenesTotPdfService {
  private readonly logger = new Logger(OrdenesTotPdfService.name);

  async generarRecibo(data: TotReciboRow): Promise<Buffer> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const logo = await this.embedEmpresaLogo(pdf);

    let y = 800;
    y = this.drawCopy(page, font, fontBold, data, y, 'Original', logo);
    y -= 16;
    page.drawLine({
      start: { x: 40, y },
      end: { x: 555, y },
      thickness: 0.8,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 28;
    this.drawCopy(page, font, fontBold, data, y, 'Copia', logo);

    const bytes = await pdf.save();
    return Buffer.from(bytes);
  }

  private async embedEmpresaLogo(pdf: PDFDocument): Promise<PDFImage | null> {
    const candidates = [
      path.resolve(
        process.cwd(),
        '..',
        '..',
        'Frontend',
        'intranet-postventa',
        'public',
        'logos',
        'empresa1.png',
      ),
      path.resolve(
        process.cwd(),
        'public',
        'logos',
        'empresa1.png',
      ),
    ];

    for (const fullPath of candidates) {
      try {
        const bytes = await fs.readFile(fullPath);
        return await pdf.embedPng(bytes);
      } catch {
        // probar siguiente ruta
      }
    }

    this.logger.warn('No se encontró logos/empresa1.png para el recibo TOT');
    return null;
  }

  private drawCopy(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    data: TotReciboRow,
    startY: number,
    copyLabel: string,
    logo: PDFImage | null,
  ): number {
    let y = startY;
    const dark = rgb(0.1, 0.1, 0.1);

    if (logo) {
      const maxW = 150;
      const maxH = 40;
      const scale = Math.min(maxW / logo.width, maxH / logo.height);
      const w = logo.width * scale;
      const h = logo.height * scale;
      page.drawImage(logo, {
        x: 40,
        y: y - h + 8,
        width: w,
        height: h,
      });
    }

    page.drawText('Recibo salida de TOT', {
      x: 210,
      y,
      size: 16,
      font: fontBold,
      color: dark,
    });
    y -= 18;
    page.drawText('CODIESEL SA', {
      x: 250,
      y,
      size: 12,
      font: fontBold,
      color: dark,
    });
    y -= 16;
    page.drawText('Kilometro 7 via Girón', {
      x: 225,
      y,
      size: 11,
      font,
      color: dark,
    });
    y -= 28;

    const fields: Array<[string, string]> = [
      ['Autoriza', data.nombres ?? ''],
      ['Numero de Orden', data.orden ?? ''],
      ['Placa', data.placa ?? ''],
      ['Fecha', data.fecha_salida ?? ''],
      ['Proveedor', data.proveedor ?? ''],
      ['Vehiculo', data.descripcion ?? ''],
      ['Aseguradora', data.aseguradora ?? ''],
    ];

    for (const [label, value] of fields) {
      page.drawText(`${label}:`, {
        x: 40,
        y,
        size: 10,
        font: fontBold,
        color: dark,
      });
      page.drawText(String(value).slice(0, 70), {
        x: 150,
        y,
        size: 10,
        font,
        color: dark,
      });
      y -= 16;
    }

    y -= 8;
    page.drawText('Contiene', {
      x: 40,
      y,
      size: 10,
      font: fontBold,
      color: dark,
    });
    y -= 14;

    const contenido = (data.contenido ?? '').trim() || '—';
    const lines = this.wrapText(contenido, 70);
    for (const line of lines.slice(0, 6)) {
      page.drawText(line, { x: 40, y, size: 10, font, color: dark });
      y -= 14;
    }

    y -= 20;
    page.drawText('____________________________________', {
      x: 180,
      y,
      size: 11,
      font,
      color: dark,
    });
    y -= 14;
    page.drawText('Firma del empleado', {
      x: 220,
      y,
      size: 10,
      font,
      color: dark,
    });
    y -= 18;
    page.drawText(copyLabel, {
      x: 270,
      y,
      size: 11,
      font: fontBold,
      color: dark,
    });

    return y;
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [''];
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }
}
