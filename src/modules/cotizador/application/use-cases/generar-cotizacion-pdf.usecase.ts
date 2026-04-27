import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ICotizadorInformesRepository } from '../../domain/cotizador-informes.repository';
import {
  getBrandPdfConfig,
  type BrandPdfConfig,
} from '../config/brand-pdf.config';
import type { OrigenCotizacion } from './actualizar-estado-cotizacion.usecase';

export interface GenerarCotizacionPdfParams {
  origen: OrigenCotizacion;
  idCotizacion: number;
  placa: string;
  /** 1=Codiesel, 2=Dieselco, 3=Mitsubishi, 4=BYD. Opcional; default Codiesel. */
  idEmpresa?: number;
}

const MARGIN = 40;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const FONT_SIZE = 10;
const ROW_HEIGHT = 16;
const HEADER_BAR_HEIGHT = 64;

const BRAND_HEADER_BANNERS: Record<number, string> = {
  1: 'HEADER-Chevrolet.png',
  2: 'HEADER-Dieselco.png',
  3: 'HEADER-Mitsubishi.png',
  4: 'HEADER-BYD.png',
};

@Injectable()
export class GenerarCotizacionPdfUseCase {
  constructor(private readonly informesRepo: ICotizadorInformesRepository) {}

  private async leerBannerHeader(idEmpresa?: number): Promise<Uint8Array | null> {
    const filename = BRAND_HEADER_BANNERS[idEmpresa ?? 1] ?? BRAND_HEADER_BANNERS[1];
    const basePath = path.resolve(
      process.cwd(),
      '..',
      '..',
      'Frontend',
      'intranet-postventa',
      'public',
      'Banners',
      'Cotizador',
    );
    const fullPath = path.join(basePath, filename);
    try {
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  async execute(params: GenerarCotizacionPdfParams): Promise<Buffer> {
    const { origen, idCotizacion, placa, idEmpresa } = params;
    const brand = getBrandPdfConfig(idEmpresa);
    const c = brand.colors;

    const general =
      origen === 'livianos'
        ? await this.informesRepo.getCotizacionLivianosPdf(idCotizacion, placa)
        : await this.informesRepo.getCotizacionPesadosPdf(idCotizacion, placa);

    if (!general) {
      throw new NotFoundException(
        'No se encontró la cotización para generar el PDF.',
      );
    }

    const repuestos =
      origen === 'livianos'
        ? await this.informesRepo.getRepuestosCotiLivianos(idCotizacion)
        : await this.informesRepo.getRepuestosCotiPesados(idCotizacion);

    const mtto =
      origen === 'livianos'
        ? await this.informesRepo.getMttoCotiLivianos(idCotizacion)
        : await this.informesRepo.getMttoCotiPesados(idCotizacion);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    // Header visual con banner por empresa.
    const bannerHeader = await this.leerBannerHeader(idEmpresa);
    if (bannerHeader) {
      const pngBanner = await pdfDoc.embedPng(bannerHeader);
      page.drawImage(pngBanner, {
        x: 0,
        y: PAGE_HEIGHT - HEADER_BAR_HEIGHT,
        width: PAGE_WIDTH,
        height: HEADER_BAR_HEIGHT,
      });
    } else {
      // Fallback en caso de no encontrar el archivo del banner.
      page.drawRectangle({
        x: 0,
        y: PAGE_HEIGHT - HEADER_BAR_HEIGHT,
        width: PAGE_WIDTH,
        height: HEADER_BAR_HEIGHT,
        color: rgb(c.primary.r, c.primary.g, c.primary.b),
      });
      page.drawText('COTIZACIÓN DE MANTENIMIENTO', {
        x: MARGIN,
        y: PAGE_HEIGHT - HEADER_BAR_HEIGHT + 10,
        size: 12,
        font: fontBold,
        color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
      });
      page.drawText(brand.nombre, {
        x: PAGE_WIDTH - MARGIN - 80,
        y: PAGE_HEIGHT - HEADER_BAR_HEIGHT + 10,
        size: 11,
        font: font,
        color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
      });
    }

    // Punto de inicio del contenido principal.
    // Bajamos un poco más para que el bloque de bodega/número/fecha
    // quede visualmente centrado entre el header de color y la primera tabla.
    let y = PAGE_HEIGHT - HEADER_BAR_HEIGHT - 40;

    const drawText = (
      p: { page: PDFPage; font: any },
      text: string,
      x: number,
      w: number,
      options?: { size?: number; bold?: boolean },
    ) => {
      const size = options?.size ?? FONT_SIZE;
      const f = options?.bold ? fontBold : font;
      const truncated = text.length > 50 ? text.slice(0, 47) + '...' : text;
      p.page.drawText(truncated, { x, y, size, font: f, maxWidth: w });
    };

    type PDFPage = ReturnType<typeof pdfDoc.addPage>;

    const idCotizacionStr = String(general.id_cotizacion).padStart(4, '0');
    const fechaStr =
      general.fecha_creacion instanceof Date
        ? general.fecha_creacion.toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : String(general.fecha_creacion);

    // Bloque bodega (izq) y número/fecha (der)
    drawText({ page, font }, general.NomBodega ?? '', MARGIN, 200, {
      size: 12,
    });
    y -= ROW_HEIGHT;
    drawText(
      { page, font },
      `Dirección: ${general.direccion ?? ''}`,
      MARGIN,
      250,
    );
    y -= ROW_HEIGHT;
    drawText(
      { page, font },
      `Telf: 607 ${general.telefono ?? ''}`,
      MARGIN,
      150,
    );
    y -= ROW_HEIGHT;

    const rightX = PAGE_WIDTH - MARGIN - 220;
    const saveY = y;
    // Alinear el bloque derecho (número/fecha) en la misma banda vertical
    // que el bloque izquierdo de bodega, respetando el margen superior extra.
    y = PAGE_HEIGHT - HEADER_BAR_HEIGHT - 40;
    drawText(
      { page, font },
      `Número cotización: ${idCotizacionStr}`,
      rightX,
      220,
    );
    y -= ROW_HEIGHT;
    drawText({ page, font }, `Fecha cotización: ${fechaStr}`, rightX, 220);
    // Recuperar y para seguir dibujando justo debajo del bloque izquierdo
    y = saveY - ROW_HEIGHT;

    // Tabla Información del asesor
    y = this.drawTable(
      { page, font: font as any, fontBold: fontBold as any },
      brand,
      ['Información del asesor'],
      [['Asesor', 'Correo asesor', 'Telefono']],
      [[general.asesor ?? '', general.correo ?? '', general.telAsesor ?? '']],
      [120, 180, 120],
      y,
    );

    // Tabla Vehículo / Cliente
    const revisionStr =
      general.revision != null ? String(general.revision) : '--';
    const nombreClienteCorto = this.getShortName(general.nombreCliente);
    y = this.drawTable(
      { page, font: font as any, fontBold: fontBold as any },
      brand,
      ['Vehículo / Cliente'],
      [['CC o Nit', 'Cliente', 'Placa', 'Modelo', 'Revisión']],
      [
        [
          general.nitCliente ?? '',
          nombreClienteCorto,
          general.placa,
          general.des_modelo ?? '--',
          revisionStr,
        ],
      ],
      [80, 100, 60, 120, 50],
      y,
    );

    // Tabla Repuestos
    const repuestosHeaders = [
      ['Codigo', 'Descripcion', 'Categoria', 'Estado', 'Valor'],
    ];
    // Subtotales repuestos
    const sumaR = repuestos.reduce(
      (acc, r) => (r.estado === 1 ? acc + r.valor : acc),
      0,
    );
    const repuestosRows = repuestos.map((r) => {
      // Normalizar saltos de línea y espacios en la descripción para que textos
      // como "MANDATORIO\nCODIESEL" aparezcan en una sola línea y no generen
      // filas visuales adicionales que parezcan categorías sueltas.
      const descLimpia = r.descripcion.replace(/\s+/g, ' ').trim();

      // Normalizar categoría: si viene como "MANDATORIO CODIESEL" (u otra variante
      // que termine en CODIESEL), mostrarla abreviada como "M.CODIESEL".
      let categoria = r.categoria ?? '--';
      if (categoria && categoria.toUpperCase().endsWith('CODIESEL')) {
        categoria = 'M.CODIESEL';
      }

      return [
        r.codigo,
        descLimpia,
        categoria,
        r.estado === 1 ? 'Autorizado' : 'No autorizado',
        `$${Number(r.valor).toLocaleString('es-CO')}`,
      ];
    });
    // Fila de subtotal repuestos
    repuestosRows.push([
      '',
      '',
      '',
      'Subtotal repuestos',
      `$${Number(sumaR).toLocaleString('es-CO')}`,
    ]);
    // Anchos lógicos de columnas para repuestos (suman 500):
    //  - Col1 + Col2 (Código + Descripción) tienen el mismo ancho que
    //    la primera columna de Mantenimiento.
    //  - Las 3 últimas columnas (Categoría, Estado, Valor) se alinean
    //    verticalmente con las 3 últimas de Mantenimiento.
    //  Repuestos: [Cód, Desc, Cat, Est, Val] -> [80, 200, 70, 70, 80]
    //  (Descripción gana más espacio; Categoría, Estado y Valor se reducen)
    const repuestosWidths = [80, 200, 70, 70, 80];
    y = this.drawTable(
      { page, font: font as any, fontBold: fontBold as any },
      brand,
      ['Repuestos'],
      repuestosHeaders,
      repuestosRows,
      repuestosWidths,
      y,
    );

    // Tabla Mantenimiento
    const mttoHeaders = [['Descripcion', 'Estado', 'Tiempo', 'Valor']];
    let sumTiempo = 0;
    let sumaM = 0;
    mtto.forEach((m) => {
      if (m.estado === 1) {
        sumTiempo += m.cant_horas;
        sumaM += m.valor;
      }
    });
    const mttoRows = mtto.map((m) => [
      m.mtto,
      m.estado === 1 ? 'Autorizado' : 'No autorizado',
      `${m.cant_horas.toFixed(1)} h`,
      `$${Number(m.valor).toLocaleString('es-CO')}`,
    ]);
    // Fila de subtotal mantenimiento
    mttoRows.push([
      'Subtotal mantenimiento',
      '',
      `${sumTiempo.toFixed(1)} h`,
      `$${Number(sumaM).toLocaleString('es-CO')}`,
    ]);
    y = this.drawTable(
      { page, font: font as any, fontBold: fontBold as any },
      brand,
      ['Mantenimiento'],
      mttoHeaders,
      mttoRows,
      // Anchos lógicos de columnas para mantenimiento (suman 500):
      //  [Desc, Estado, Tiempo, Valor] -> [280, 70, 70, 80]
      //  La 1ª columna (280) coincide con Código+Descripción de repuestos (80+200),
      //  y las 3 últimas se alinean con Categoría, Estado y Valor de repuestos.
      [280, 70, 70, 80],
      y,
    );

    // Totales (color de marca)
    const totalY = y - ROW_HEIGHT + 16;
    page.drawRectangle({
      x: MARGIN,
      y: totalY - ROW_HEIGHT * 2,
      width: PAGE_WIDTH - MARGIN * 2,
      height: ROW_HEIGHT * 2,
      color: rgb(c.primary.r, c.primary.g, c.primary.b),
    });
    page.drawText(
      `Tiempo estimado en el taller: ${sumTiempo.toFixed(1)} horas`,
      {
        x: MARGIN + 8,
        y: totalY - ROW_HEIGHT + 4,
        size: FONT_SIZE,
        font,
        color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
      },
    );
    page.drawText(`$${Number(sumaM + sumaR).toLocaleString('es-CO')}`, {
      x: PAGE_WIDTH - MARGIN - 80,
      y: totalY - ROW_HEIGHT + 4,
      size: FONT_SIZE,
      font,
      color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
    });
    page.drawText('Total cotización', {
      x: MARGIN + 8,
      y: totalY - ROW_HEIGHT * 2 + 4,
      size: FONT_SIZE,
      font: fontBold,
      color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
    });
    page.drawText(`$${Number(sumaM + sumaR).toLocaleString('es-CO')}`, {
      x: PAGE_WIDTH - MARGIN - 80,
      y: totalY - ROW_HEIGHT * 2 + 4,
      size: FONT_SIZE,
      font: fontBold,
      color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
    });
    // Justo debajo del bloque de totales, sin tanto espacio
    y = totalY - ROW_HEIGHT * 2 - 16;

    // Observaciones (debajo del total, con ancho idéntico al de las tablas)
    if (general.observaciones) {
      page.drawText('Observaciones:', {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font: fontBold,
      });
      y -= ROW_HEIGHT;
      const maxLineWidth = PAGE_WIDTH - 2 * MARGIN;
      const obsLines = this.wrapByWidth(
        general.observaciones,
        font,
        FONT_SIZE,
        maxLineWidth,
      );
      for (const line of obsLines) {
        if (y < MARGIN + 80) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - MARGIN;
        }
        page.drawText(line, {
          x: MARGIN,
          y,
          size: FONT_SIZE,
          font,
        });
        y -= ROW_HEIGHT;
      }
      y -= 8;
    }

    // Notas al pie (footer estilo legacy)
    const footerNotes = [
      '* Los repuestos clasificados en MANDATORIOS corresponden a los incluidos en mantenimientos prepagados. Las demás operaciones y repuestos deben ser cancelados por el cliente. La Alineación y el Balanceo no están incluidos en los mantenimientos prepagados.',
      '* Validez de la oferta en repuestos 5 días y 30 días en mano de obra y otros.',
      '* Garantía 1 año o 20.000 Km a partir de la fecha de entrega del servicio en el taller, en repuestos que no correspondan a partes de desgaste.',
      '* Según el cupón de garantía, la no sustitución de repuestos mandatorios conlleva a la renuncia del beneficio de extensión de garantía y a la garantía de fábrica.',
    ];
    if (general.revision === 0) {
      footerNotes.push(
        '* La presente rutina de mantenimiento aplica para vehículos fuera de garantía.',
      );
    }
    for (const note of footerNotes) {
      const maxLineWidth = PAGE_WIDTH - 2 * MARGIN;
      const lines = this.wrapByWidth(note, font, 9, maxLineWidth);
      for (const line of lines) {
        if (y < MARGIN + 40) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - MARGIN;
        }
        page.drawText(line, {
          x: MARGIN,
          y,
          size: 9,
          font,
        });
        y -= 12;
      }
      y -= 4;
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }

  private wrapText(text: string, maxChars: number): string[] {
    const lines: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= maxChars) {
        lines.push(remaining);
        break;
      }
      const chunk = remaining.slice(0, maxChars);
      const lastSpace = chunk.lastIndexOf(' ');
      const breakAt = lastSpace > 0 ? lastSpace : maxChars;
      lines.push(remaining.slice(0, breakAt).trim());
      remaining = remaining.slice(breakAt).trim();
    }
    return lines;
  }

  /**
   * Envuelve texto respetando un ancho máximo real (en puntos),
   * usando la métrica de la fuente para que nunca se pase del ancho de las tablas.
   */
  private wrapByWidth(
    text: string,
    pdfFont: any,
    fontSize: number,
    maxWidth: number,
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const width = pdfFont.widthOfTextAtSize(candidate, fontSize);
      if (width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
    return lines;
  }

  private getShortName(nombreCompleto: string): string {
    if (!nombreCompleto) return '';
    const partes = nombreCompleto
      .split(' ')
      .map((p) => p.trim())
      .filter(Boolean);
    if (partes.length === 0) return '';
    if (partes.length === 1) return partes[0];
    const primero = partes[0];
    const ultimo = partes[partes.length - 1];
    return `${primero} ${ultimo}`;
  }

  private drawTable(
    ctx: { page: any; font: any; fontBold: any },
    brand: BrandPdfConfig,
    title: string[],
    headers: string[][],
    rows: string[][],
    colWidths: number[],
    startY: number,
  ): number {
    // Ajustar todas las tablas al mismo ancho (PAGE_WIDTH - 2 * MARGIN)
    const availableWidth = PAGE_WIDTH - MARGIN * 2;
    const originalWidth = colWidths.reduce((a, b) => a + b, 0);
    const scale = originalWidth > 0 ? availableWidth / originalWidth : 1;
    const scaledColWidths = colWidths.map((w) => w * scale);

    const tableWidth = availableWidth;
    const tableX = MARGIN;
    const c = brand.colors;
    let y = startY;

    if (y < MARGIN + 60) {
      return startY;
    }

    // Título (color primary de la marca)
    ctx.page.drawRectangle({
      x: tableX,
      y: y - ROW_HEIGHT,
      width: tableWidth,
      height: ROW_HEIGHT,
      color: rgb(c.primary.r, c.primary.g, c.primary.b),
    });
    // Centrar el título de la tabla (Información del asesor, Vehículo / Cliente, Repuestos, Mantenimiento)
    const titleText = title[0];
    const approxTitleWidth = titleText.length * FONT_SIZE * 0.5;
    const titleX = tableX + tableWidth / 2 - approxTitleWidth / 2;
    ctx.page.drawText(titleText, {
      x: titleX,
      y: y - ROW_HEIGHT + 4,
      size: FONT_SIZE,
      font: ctx.fontBold,
      color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
    });
    y -= ROW_HEIGHT;

    // Headers (tono claro de la marca)
    ctx.page.drawRectangle({
      x: tableX,
      y: y - ROW_HEIGHT,
      width: tableWidth,
      height: ROW_HEIGHT,
      color: rgb(c.primaryLight.r, c.primaryLight.g, c.primaryLight.b),
    });
    const darkText = rgb(0.2, 0.2, 0.2);
    // Dejar los nombres de las columnas alineados a la izquierda dentro de cada celda,
    // como estaban originalmente.
    let x = tableX + 4;
    headers[0].forEach((h, i) => {
      ctx.page.drawText(h, {
        x,
        y: y - ROW_HEIGHT + 4,
        size: FONT_SIZE,
        font: ctx.fontBold,
        color: darkText,
      });
      x += scaledColWidths[i];
    });
    y -= ROW_HEIGHT;

    // Filas
    for (const row of rows) {
      if (y < MARGIN + 30) break;
      let xx = tableX + 4;
      row.forEach((cell, i) => {
        const truncated = cell.length > 35 ? cell.slice(0, 32) + '...' : cell;
        ctx.page.drawText(truncated, {
          x: xx,
          y: y - ROW_HEIGHT + 4,
          size: FONT_SIZE - 1,
          font: ctx.font,
          maxWidth: scaledColWidths[i] - 8,
        });
        xx += scaledColWidths[i];
      });
      y -= ROW_HEIGHT;
    }

    // Bordes
    ctx.page.drawRectangle({
      x: tableX,
      y: y,
      width: tableWidth,
      height: startY - y,
      borderWidth: 0.5,
      borderColor: rgb(0.4, 0.4, 0.4),
    });
    return y - 12;
  }
}
