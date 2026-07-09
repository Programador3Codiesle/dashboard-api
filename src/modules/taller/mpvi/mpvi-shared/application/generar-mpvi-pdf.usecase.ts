import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getBrandPdfConfig } from '../../../../../core/infra/pdf/brand-pdf.config';
import {
  drawBrandHeader,
  drawBrandSummaryTotals,
  drawBrandTable,
  drawBrandTableFooterTotals,
  drawPdfFooterNotes,
  drawPdfParagraph,
  formatPdfMoney,
  getContentStartY,
  PDF_LAYOUT,
  type PdfDrawContext,
} from '../../../../../core/infra/pdf/pdf-document.helper';
import { IMpviCotizacionRepository } from '../domain/mpvi-cotizacion.repository';
import { buildTablaServicio } from './helpers/mpvi-tabla.builder';
import type {
  MpviTablaServicio,
  MpviTablaServicioFila,
} from './helpers/mpvi.types';

export interface GenerarMpviPdfParams {
  idCotizacion: number;
  quienVisualiza: number;
  /**
   * Modo de filtrado PDF (legacy pdfOrigen):
   * 0 = gestión servicio (autorizado + ejecutado)
   * 1 = técnico (todas las líneas)
   * 2 = BDC / contact (no autorizado, no ejecutado)
   */
  pdfGestion?: number;
  /** @deprecated Usar pdfGestion. true → 0, false/omitido → 1 */
  pdfGestionServicio?: boolean;
  /** 1=Codiesel, 2=Dieselco, 3=Mitsubishi, 4=BYD */
  idEmpresa?: number;
}

@Injectable()
export class GenerarMpviPdfUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(params: GenerarMpviPdfParams): Promise<Buffer> {
    const encabezado = await this.repo.getEncabezado(params.idCotizacion);
    const cot = encabezado[0];
    if (!cot) {
      throw new NotFoundException('No se encontró la cotización solicitada.');
    }

    const brand = getBrandPdfConfig(params.idEmpresa);
    const pdfGestion =
      params.pdfGestion != null
        ? Number(params.pdfGestion)
        : params.pdfGestionServicio
          ? 0
          : 1;
    const esPDF = true;
    const qv = params.quienVisualiza;
    const esVistaInterna = qv !== 0;

    const tablaU = await this.cargarTabla(cot, 'U', qv, esPDF, pdfGestion);
    const tablaR = await this.cargarTabla(cot, 'R', qv, esPDF, pdfGestion);
    const firma = await this.repo.validarExisteFirma(params.idCotizacion);
    const totalNeto = tablaU.totales.neto + tablaR.totales.neto;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([PDF_LAYOUT.PAGE_WIDTH, PDF_LAYOUT.PAGE_HEIGHT]);

    let ctx: PdfDrawContext = { pdfDoc, page, font, fontBold };

    await drawBrandHeader(ctx, brand, params.idEmpresa, {
      fallbackTitle: 'INSPECCIÓN MULTI PUNTO',
    });

    let y = getContentStartY();
    const { MARGIN, PAGE_WIDTH, ROW_HEIGHT, FONT_SIZE } = PDF_LAYOUT;

    const nomBodega = String(cot.nom_bodega ?? `Bodega ${cot.bod}`);
    page.drawText(nomBodega, { x: MARGIN, y, size: 12, font });
    y -= ROW_HEIGHT;
    if (cot.direccion) {
      page.drawText(`Dirección: ${cot.direccion}`, {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font,
      });
      y -= ROW_HEIGHT;
    }
    if (cot.telefono) {
      page.drawText(`Telf: 607 ${cot.telefono}`, {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font,
      });
      y -= ROW_HEIGHT;
    }

    const rightX = PAGE_WIDTH - MARGIN - 220;
    const blockBottomY = y;
    y = getContentStartY();
    const idStr = String(cot.id).padStart(4, '0');
    page.drawText(`Número cotización: ${idStr}`, {
      x: rightX,
      y,
      size: FONT_SIZE,
      font,
    });
    y -= ROW_HEIGHT;
    page.drawText(`Placa: ${cot.placa.toUpperCase()}`, {
      x: rightX,
      y,
      size: FONT_SIZE,
      font,
    });
    y -= ROW_HEIGHT;
    page.drawText(`N° Orden: ${cot.num_orden ?? '—'}`, {
      x: rightX,
      y,
      size: FONT_SIZE,
      font,
    });
    y -= ROW_HEIGHT;
    page.drawText(`Fecha: ${cot.fecha}`, {
      x: rightX,
      y,
      size: FONT_SIZE,
      font,
    });
    y = blockBottomY - ROW_HEIGHT;

    const resultadoCliente = drawBrandTable(
      ctx,
      brand,
      'Cliente / Vehículo',
      ['Cliente', 'Celular', 'Correo', 'Placa'],
      [
        [
          String(cot.nombre ?? ''),
          String(cot.celular),
          cot.correo,
          cot.placa.toUpperCase(),
        ],
      ],
      [95, 70, 210, 70],
      y,
      { cellFontSize: 8, cellLineHeight: 10 },
    );
    page = resultadoCliente.page;
    y = resultadoCliente.y;
    ctx = { ...ctx, page };

    const resultadoU = this.dibujarSeccionMpvi(
      ctx,
      brand,
      'PUNTOS DE CAMBIO URGENTE',
      tablaU,
      esVistaInterna,
      y,
    );
    page = resultadoU.page;
    y = resultadoU.y;
    ctx = { ...ctx, page };

    const resultadoR = this.dibujarSeccionMpvi(
      ctx,
      brand,
      'PUNTOS DE CAMBIO RECOMENDADO',
      tablaR,
      esVistaInterna,
      y,
    );
    page = resultadoR.page;
    y = resultadoR.y;
    ctx = { ...ctx, page };

    y = drawBrandSummaryTotals(
      ctx,
      brand,
      'Total neto cotización MPVI',
      formatPdfMoney(totalNeto),
      y,
    );

    if (cot.nota?.trim()) {
      const nota = drawPdfParagraph(ctx, 'Nota', cot.nota.trim(), y);
      page = nota.page;
      y = nota.y;
      ctx = { ...ctx, page };
    }

    const notaCliente =
      'Estimado cliente, es importante destacar que la seguridad y el rendimiento óptimo de su vehículo dependen de la correcta implementación de los repuestos y servicios descritos en esta cotización. Si no se autoriza la realización de todos los trabajos cotizados, podría haber consecuencias negativas en los componentes principales del automóvil.';

    const parrafo = drawPdfParagraph(ctx, null, notaCliente, y);
    page = parrafo.page;
    y = parrafo.y;
    ctx = { ...ctx, page };

    const footerNotes = [
      '* Validez de la oferta sujeta a disponibilidad de repuestos y confirmación del taller.',
      `* Firma registrada: ${firma ? 'Sí' : 'No'}.`,
    ];
    drawPdfFooterNotes(ctx, footerNotes, y);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async cargarTabla(
    cot: { bod: number; placa: string; id: number },
    tipo: 'U' | 'R',
    qv: number,
    esPDF: boolean,
    pdfGestion: number,
  ): Promise<MpviTablaServicio> {
    const mano = await this.repo.getValorManoObraPdf(
      cot.bod,
      cot.placa,
      cot.id,
      tipo,
      qv,
      null,
      esPDF,
      pdfGestion,
    );
    const rep = await this.repo.getValorRepuestosPdf(
      cot.bod,
      cot.placa,
      cot.id,
      tipo,
      qv,
      null,
      esPDF,
      pdfGestion,
    );
    return buildTablaServicio(mano, rep, tipo);
  }

  private dibujarSeccionMpvi(
    ctx: PdfDrawContext,
    brand: ReturnType<typeof getBrandPdfConfig>,
    titulo: string,
    tabla: MpviTablaServicio,
    esVistaInterna: boolean,
    startY: number,
  ): { page: typeof ctx.page; y: number } {
    const headers = esVistaInterna
      ? [
          'Operación',
          'Descripción',
          'Horas',
          'Referencia',
          'Repuesto',
          'Cant',
          'Disp',
          'Valor Rep.',
          'M.O.',
          'Autoriza',
        ]
      : ['Descripción', 'Repuesto', 'Cant', 'Valor Rep.', 'M.O.', 'Autoriza'];

    const colWidths = esVistaInterna
      ? [34, 86, 24, 36, 94, 20, 20, 52, 50, 50]
      : [108, 112, 28, 68, 68, 48];

    const filas = tabla.filas.map((fila) =>
      this.filaToCells(fila, esVistaInterna),
    );

    const result = drawBrandTable(
      ctx,
      brand,
      titulo,
      headers,
      filas,
      colWidths,
      startY,
      {
        cellFontSize: 8,
        cellLineHeight: 10,
        cellPadding: 3,
        moneyColumnIndices: esVistaInterna ? [7, 8] : [3, 4],
      },
    );

    const footer = drawBrandTableFooterTotals(
      { ...ctx, page: result.page },
      brand,
      {
        label: `TOTAL ${titulo}`,
        repuestos: formatPdfMoney(tabla.totales.repuestos),
        manoObra: formatPdfMoney(tabla.totales.manoObra),
        neto: formatPdfMoney(tabla.totales.neto),
      },
      result.y,
      colWidths,
    );

    return footer;
  }

  private filaToCells(
    fila: MpviTablaServicioFila,
    esVistaInterna: boolean,
  ): string[] {
    const operacion = fila.operacion || '—';
    const descripcion = fila.descripcion || '—';
    const repuesto =
      fila.repuesto && fila.repuesto !== 'N/A' ? fila.repuesto : '—';
    const referencia =
      fila.codRepuesto && fila.codRepuesto !== 'N/A' ? fila.codRepuesto : '—';
    const autoriza = fila.autorizado ? 'Sí' : 'No';
    const disp = fila.disponible ? 'Sí' : 'No';

    if (esVistaInterna) {
      return [
        operacion,
        descripcion,
        fila.tiempo.toFixed(2),
        referencia,
        repuesto,
        String(fila.cantidad),
        disp,
        formatPdfMoney(fila.valorRepuesto),
        formatPdfMoney(fila.manoObra),
        autoriza,
      ];
    }

    return [
      descripcion,
      repuesto,
      String(fila.cantidad),
      formatPdfMoney(fila.valorRepuesto),
      formatPdfMoney(fila.manoObra),
      autoriza,
    ];
  }
}
