/**
 * Configuración de marcas para PDFs (cotizador, MPVI, etc.).
 * Colores en RGB 0-1 para pdf-lib.
 */
export type IdEmpresa = 1 | 2 | 3 | 4;

export interface BrandPdfColors {
  primary: { r: number; g: number; b: number };
  primaryLight: { r: number; g: number; b: number };
  primaryText: { r: number; g: number; b: number };
}

export interface BrandPdfConfig {
  nombre: string;
  colors: BrandPdfColors;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

const BRANDS: Record<IdEmpresa, BrandPdfConfig> = {
  1: {
    nombre: 'Codiesel',
    colors: {
      primary: hexToRgb('#f59e0b'),
      primaryLight: hexToRgb('#fef3c7'),
      primaryText: { r: 1, g: 1, b: 1 },
    },
  },
  2: {
    nombre: 'Dieselco',
    colors: {
      primary: hexToRgb('#4cb8aa'),
      primaryLight: hexToRgb('#e6f7f5'),
      primaryText: { r: 1, g: 1, b: 1 },
    },
  },
  3: {
    nombre: 'Mitsubishi',
    colors: {
      primary: hexToRgb('#ed0000'),
      primaryLight: hexToRgb('#fde8e8'),
      primaryText: { r: 1, g: 1, b: 1 },
    },
  },
  4: {
    nombre: 'BYD',
    colors: {
      primary: hexToRgb('#4f9edd'),
      primaryLight: hexToRgb('#e8f4fc'),
      primaryText: { r: 1, g: 1, b: 1 },
    },
  },
};

const DEFAULT_BRAND: BrandPdfConfig = BRANDS[1];

export function getBrandPdfConfig(idEmpresa?: number | null): BrandPdfConfig {
  if (idEmpresa != null && idEmpresa >= 1 && idEmpresa <= 4) {
    return BRANDS[idEmpresa as IdEmpresa];
  }
  return DEFAULT_BRAND;
}
