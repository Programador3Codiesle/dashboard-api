import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { BrandPdfConfig } from './brand-pdf.config';

export const PDF_LAYOUT = {
  MARGIN: 40,
  PAGE_WIDTH: 595,
  PAGE_HEIGHT: 842,
  FONT_SIZE: 10,
  ROW_HEIGHT: 16,
  HEADER_BAR_HEIGHT: 64,
} as const;

export const BRAND_HEADER_BANNERS: Record<number, string> = {
  1: 'HEADER-Chevrolet.png',
  2: 'HEADER-Dieselco.png',
  3: 'HEADER-Mitsubishi.png',
  4: 'HEADER-BYD.png',
};

export type PdfDrawContext = {
  pdfDoc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
};

export async function readBrandHeaderBanner(
  idEmpresa?: number,
): Promise<Uint8Array | null> {
  const filename =
    BRAND_HEADER_BANNERS[idEmpresa ?? 1] ?? BRAND_HEADER_BANNERS[1];
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

export async function drawBrandHeader(
  ctx: PdfDrawContext,
  brand: BrandPdfConfig,
  idEmpresa?: number,
  options?: { fallbackTitle?: string },
): Promise<void> {
  const { PAGE_WIDTH, PAGE_HEIGHT, MARGIN, HEADER_BAR_HEIGHT } = PDF_LAYOUT;
  const c = brand.colors;
  const fallbackTitle = options?.fallbackTitle ?? 'COTIZACIÓN DE MANTENIMIENTO';
  const bannerHeader = await readBrandHeaderBanner(idEmpresa);

  if (bannerHeader) {
    const pngBanner = await ctx.pdfDoc.embedPng(bannerHeader);
    ctx.page.drawImage(pngBanner, {
      x: 0,
      y: PAGE_HEIGHT - HEADER_BAR_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_BAR_HEIGHT,
    });
    return;
  }

  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - HEADER_BAR_HEIGHT,
    width: PAGE_WIDTH,
    height: HEADER_BAR_HEIGHT,
    color: rgb(c.primary.r, c.primary.g, c.primary.b),
  });
  ctx.page.drawText(fallbackTitle, {
    x: MARGIN,
    y: PAGE_HEIGHT - HEADER_BAR_HEIGHT + 10,
    size: 12,
    font: ctx.fontBold,
    color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
  });
  ctx.page.drawText(brand.nombre, {
    x: PAGE_WIDTH - MARGIN - 80,
    y: PAGE_HEIGHT - HEADER_BAR_HEIGHT + 10,
    size: 11,
    font: ctx.font,
    color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
  });
}

export function getContentStartY(): number {
  return PDF_LAYOUT.PAGE_HEIGHT - PDF_LAYOUT.HEADER_BAR_HEIGHT - 40;
}

export type DrawBrandTableOptions = {
  cellFontSize?: number;
  cellLineHeight?: number;
  cellPadding?: number;
  /** Índices de columnas con montos ($) para alinear a la derecha sin desbordar. */
  moneyColumnIndices?: number[];
};

export function drawBrandTable(
  ctx: PdfDrawContext,
  brand: BrandPdfConfig,
  title: string,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  startY: number,
  options?: DrawBrandTableOptions,
): { page: PDFPage; y: number } {
  const { MARGIN, PAGE_WIDTH, FONT_SIZE, ROW_HEIGHT } = PDF_LAYOUT;
  const availableWidth = PAGE_WIDTH - MARGIN * 2;
  const originalWidth = colWidths.reduce((a, b) => a + b, 0);
  const scale = originalWidth > 0 ? availableWidth / originalWidth : 1;
  const scaledColWidths = colWidths.map((w) => w * scale);
  const tableWidth = availableWidth;
  const tableX = MARGIN;
  const c = brand.colors;
  const darkText = rgb(0.2, 0.2, 0.2);
  const cellFontSize = options?.cellFontSize ?? FONT_SIZE - 1;
  const cellLineHeight = options?.cellLineHeight ?? 11;
  const cellPadding = options?.cellPadding ?? 3;
  const headerLineHeight = 11;

  let page = ctx.page;
  let y = startY;

  const ensureSpace = (needed: number) => {
    if (y >= MARGIN + needed) return;
    page = ctx.pdfDoc.addPage([PDF_LAYOUT.PAGE_WIDTH, PDF_LAYOUT.PAGE_HEIGHT]);
    y = PDF_LAYOUT.PAGE_HEIGHT - MARGIN;
  };

  const drawColumnHeaders = () => {
    const headerLines = headers.map((header, index) =>
      measureWrappedLines(
        header,
        ctx.fontBold,
        FONT_SIZE,
        scaledColWidths[index],
      ),
    );
    const headerRowHeight =
      Math.max(...headerLines.map((lines) => lines.length), 1) *
        headerLineHeight +
      cellPadding * 2;

    ensureSpace(headerRowHeight + 20);

    page.drawRectangle({
      x: tableX,
      y: y - headerRowHeight,
      width: tableWidth,
      height: headerRowHeight,
      color: rgb(c.primaryLight.r, c.primaryLight.g, c.primaryLight.b),
    });

    let headerX = tableX;
    headers.forEach((_, index) => {
      drawCellTextLines(
        page,
        headerLines[index],
        headerX,
        y,
        ctx.fontBold,
        FONT_SIZE,
        headerLineHeight,
        cellPadding,
        darkText,
      );
      headerX += scaledColWidths[index];
    });

    y -= headerRowHeight;
  };

  ensureSpace(60);

  const tableTopY = y;
  page.drawRectangle({
    x: tableX,
    y: y - ROW_HEIGHT,
    width: tableWidth,
    height: ROW_HEIGHT,
    color: rgb(c.primary.r, c.primary.g, c.primary.b),
  });
  const approxTitleWidth = title.length * FONT_SIZE * 0.5;
  const titleX = tableX + tableWidth / 2 - approxTitleWidth / 2;
  page.drawText(title, {
    x: titleX,
    y: y - ROW_HEIGHT + 4,
    size: FONT_SIZE,
    font: ctx.fontBold,
    color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
  });
  y -= ROW_HEIGHT;

  drawColumnHeaders();

  for (const row of rows) {
    const cellLines = row.map((cell, index) =>
      measureWrappedLines(cell, ctx.font, cellFontSize, scaledColWidths[index]),
    );
    const maxLines = Math.max(...cellLines.map((lines) => lines.length), 1);
    const rowHeight = maxLines * cellLineHeight + cellPadding * 2;

    if (y < MARGIN + rowHeight + 20) {
      page = ctx.pdfDoc.addPage([
        PDF_LAYOUT.PAGE_WIDTH,
        PDF_LAYOUT.PAGE_HEIGHT,
      ]);
      y = PDF_LAYOUT.PAGE_HEIGHT - MARGIN;
      drawColumnHeaders();
    }

    const rowTop = y;
    let cellX = tableX;
    row.forEach((cell, index) => {
      const baseline = rowTop - cellPadding - cellFontSize;
      if (options?.moneyColumnIndices?.includes(index)) {
        drawPdfAmountInColumn(
          page,
          cell ?? '',
          cellX,
          scaledColWidths[index],
          baseline,
          ctx.font,
          cellFontSize,
          darkText,
          { paddingRight: 10, paddingLeft: 2, minFontSize: 6.5 },
        );
      } else {
        drawCellTextLines(
          page,
          cellLines[index],
          cellX,
          rowTop,
          ctx.font,
          cellFontSize,
          cellLineHeight,
          cellPadding,
          darkText,
        );
      }
      cellX += scaledColWidths[index];
    });
    y -= rowHeight;
  }

  page.drawRectangle({
    x: tableX,
    y,
    width: tableWidth,
    height: tableTopY - y,
    borderWidth: 0.5,
    borderColor: rgb(0.4, 0.4, 0.4),
  });

  return { page, y: y - 12 };
}

export type BrandTableFooterTotals = {
  label: string;
  repuestos: string;
  manoObra: string;
  neto: string;
};

function drawPdfAmountInColumn(
  page: PDFPage,
  amount: string,
  colX: number,
  colWidth: number,
  baselineY: number,
  font: PDFFont,
  fontSize: number,
  color: ReturnType<typeof rgb>,
  options?: {
    paddingRight?: number;
    paddingLeft?: number;
    minFontSize?: number;
  },
): void {
  const paddingRight = options?.paddingRight ?? 12;
  const paddingLeft = options?.paddingLeft ?? 2;
  const minFontSize = options?.minFontSize ?? 6.5;
  let size = fontSize;

  let textWidth = font.widthOfTextAtSize(amount, size);
  const maxWidth = Math.max(colWidth - paddingLeft - paddingRight, 8);

  while (textWidth > maxWidth && size > minFontSize) {
    size -= 0.25;
    textWidth = font.widthOfTextAtSize(amount, size);
  }

  const x = colX + Math.max(colWidth - textWidth - paddingRight, paddingLeft);

  page.drawText(amount, {
    x,
    y: baselineY,
    size,
    font,
    color,
  });
}

/** Totales de sección debajo de la tabla, alineados con las últimas 3 columnas de montos. */
export function drawBrandTableFooterTotals(
  ctx: PdfDrawContext,
  brand: BrandPdfConfig,
  totals: BrandTableFooterTotals,
  startY: number,
  colWidths: number[],
): { page: PDFPage; y: number } {
  const { MARGIN, PAGE_WIDTH, FONT_SIZE } = PDF_LAYOUT;
  const availableWidth = PAGE_WIDTH - MARGIN * 2;
  const originalWidth = colWidths.reduce((a, b) => a + b, 0);
  const scale = originalWidth > 0 ? availableWidth / originalWidth : 1;
  const scaledColWidths = colWidths.map((w) => w * scale);
  const tableX = MARGIN;
  const c = brand.colors;
  const darkText = rgb(0.2, 0.2, 0.2);
  const footerHeight = 22;
  const fontSize = FONT_SIZE - 1;

  let page = ctx.page;
  let y = startY;

  if (y < PDF_LAYOUT.MARGIN + footerHeight + 20) {
    page = ctx.pdfDoc.addPage([PDF_LAYOUT.PAGE_WIDTH, PDF_LAYOUT.PAGE_HEIGHT]);
    y = PDF_LAYOUT.PAGE_HEIGHT - PDF_LAYOUT.MARGIN;
  }

  const amountCols = scaledColWidths.slice(-3);
  const labelWidth = scaledColWidths.slice(0, -3).reduce((a, b) => a + b, 0);
  const amountStartX = tableX + labelWidth;

  page.drawRectangle({
    x: tableX,
    y: y - footerHeight,
    width: availableWidth,
    height: footerHeight,
    color: rgb(c.primaryLight.r, c.primaryLight.g, c.primaryLight.b),
    borderWidth: 0.5,
    borderColor: rgb(0.4, 0.4, 0.4),
  });

  const labelLines = wrapPdfTextByWidth(
    totals.label,
    ctx.fontBold,
    fontSize,
    Math.max(labelWidth - 12, 40),
  );
  labelLines.slice(0, 2).forEach((line, index) => {
    page.drawText(line, {
      x: tableX + 6,
      y: y - 8 - fontSize - index * 10,
      size: fontSize,
      font: ctx.fontBold,
      color: darkText,
    });
  });

  const amounts = [totals.repuestos, totals.manoObra, totals.neto];
  const amountBaselineY = y - 8 - fontSize;
  let amountX = amountStartX;
  amounts.forEach((amount, index) => {
    const colWidth = amountCols[index] ?? 0;
    drawPdfAmountInColumn(
      page,
      amount,
      amountX,
      colWidth,
      amountBaselineY,
      ctx.fontBold,
      fontSize,
      darkText,
      { paddingRight: 12, paddingLeft: 2, minFontSize: 6.5 },
    );
    amountX += colWidth;
  });

  return { page, y: y - footerHeight - 10 };
}

export function drawBrandSummaryTotals(
  ctx: PdfDrawContext,
  brand: BrandPdfConfig,
  label: string,
  amount: string,
  startY: number,
): number {
  const { MARGIN, PAGE_WIDTH, FONT_SIZE, ROW_HEIGHT } = PDF_LAYOUT;
  const c = brand.colors;
  const barY = startY - ROW_HEIGHT;

  ctx.page.drawRectangle({
    x: MARGIN,
    y: barY - ROW_HEIGHT,
    width: PAGE_WIDTH - MARGIN * 2,
    height: ROW_HEIGHT * 2,
    color: rgb(c.primary.r, c.primary.g, c.primary.b),
  });
  ctx.page.drawText(label, {
    x: MARGIN + 8,
    y: barY - ROW_HEIGHT + 4,
    size: FONT_SIZE,
    font: ctx.fontBold,
    color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
  });
  ctx.page.drawText(amount, {
    x: PAGE_WIDTH - MARGIN - 120,
    y: barY - ROW_HEIGHT + 4,
    size: FONT_SIZE,
    font: ctx.fontBold,
    color: rgb(c.primaryText.r, c.primaryText.g, c.primaryText.b),
  });

  return barY - ROW_HEIGHT * 2 - 16;
}

export function wrapPdfTextByWidth(
  text: string,
  pdfFont: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const normalized = (text ?? '').trim();
  if (!normalized) return [''];

  const breakLongToken = (token: string): string[] => {
    const chunks: string[] = [];
    let chunk = '';
    for (const char of token) {
      const candidate = `${chunk}${char}`;
      if (pdfFont.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        chunk = candidate;
      } else {
        if (chunk) chunks.push(chunk);
        chunk = char;
      }
    }
    if (chunk) chunks.push(chunk);
    return chunks.length > 0 ? chunks : [''];
  };

  const words = normalized.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (pdfFont.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = '';
    }

    if (pdfFont.widthOfTextAtSize(word, fontSize) <= maxWidth) {
      current = word;
      continue;
    }

    const broken = breakLongToken(word);
    if (broken.length > 0) {
      lines.push(...broken.slice(0, -1));
      current = broken[broken.length - 1] ?? '';
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function drawCellTextLines(
  page: PDFPage,
  lines: string[],
  x: number,
  rowTop: number,
  font: PDFFont,
  fontSize: number,
  lineHeight: number,
  padding: number,
  color: ReturnType<typeof rgb>,
): void {
  lines.forEach((line, lineIndex) => {
    if (!line) return;
    page.drawText(line, {
      x: x + padding,
      y: rowTop - padding - fontSize - lineIndex * lineHeight,
      size: fontSize,
      font,
      color,
    });
  });
}

function measureWrappedLines(
  text: string,
  pdfFont: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  return wrapPdfTextByWidth(text, pdfFont, fontSize, Math.max(maxWidth - 8, 8));
}

export function drawPdfParagraph(
  ctx: PdfDrawContext,
  title: string | null,
  text: string,
  startY: number,
): { page: PDFPage; y: number } {
  const { MARGIN, PAGE_WIDTH, FONT_SIZE, ROW_HEIGHT } = PDF_LAYOUT;
  let page = ctx.page;
  let y = startY;

  if (title) {
    page.drawText(title, {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font: ctx.fontBold,
    });
    y -= ROW_HEIGHT;
  }

  const maxLineWidth = PAGE_WIDTH - 2 * MARGIN;
  const lines = wrapPdfTextByWidth(text, ctx.font, FONT_SIZE, maxLineWidth);
  for (const line of lines) {
    if (y < MARGIN + 40) {
      page = ctx.pdfDoc.addPage([
        PDF_LAYOUT.PAGE_WIDTH,
        PDF_LAYOUT.PAGE_HEIGHT,
      ]);
      y = PDF_LAYOUT.PAGE_HEIGHT - MARGIN;
    }
    page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font: ctx.font });
    y -= ROW_HEIGHT;
  }

  return { page, y: y - 8 };
}

export function drawPdfFooterNotes(
  ctx: PdfDrawContext,
  notes: string[],
  startY: number,
): { page: PDFPage; y: number } {
  const { MARGIN, PAGE_WIDTH } = PDF_LAYOUT;
  let page = ctx.page;
  let y = startY;

  for (const note of notes) {
    const maxLineWidth = PAGE_WIDTH - 2 * MARGIN;
    const lines = wrapPdfTextByWidth(note, ctx.font, 9, maxLineWidth);
    for (const line of lines) {
      if (y < MARGIN + 40) {
        page = ctx.pdfDoc.addPage([
          PDF_LAYOUT.PAGE_WIDTH,
          PDF_LAYOUT.PAGE_HEIGHT,
        ]);
        y = PDF_LAYOUT.PAGE_HEIGHT - MARGIN;
      }
      page.drawText(line, { x: MARGIN, y, size: 9, font: ctx.font });
      y -= 12;
    }
    y -= 4;
  }

  return { page, y };
}

export function getShortClientName(nombreCompleto: string): string {
  if (!nombreCompleto) return '';
  const partes = nombreCompleto
    .split(' ')
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

export function formatPdfMoney(value: number): string {
  return `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value ?? 0)}`;
}
