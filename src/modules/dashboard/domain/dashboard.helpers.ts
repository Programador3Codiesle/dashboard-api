/**
 * Helpers de dominio: mapeo sedes → nombre y configuración por sede para técnicos.
 * Usados por services (jefe-taller, técnico).
 */

export function mapSedesToSedeName(sedesIds: string): string {
  const trimmed = sedesIds.replace(/\s/g, '');
  switch (trimmed) {
    case '1':
      return 'giron';
    case '6':
      return 'barranca';
    case '8,14,16,22':
      return 'bocono';
    case '8':
      return 'bocono';
    case '7':
      return 'rosita';
    default:
      return '';
  }
}

export interface TecnicosSedeConfig {
  sede: string;
  sedesRanking: string;
  sedesVentasRanking: string;
  topeRanPres: number;
}

/**
 * Configuración por sedes_usu para dashboard de técnicos (ranking, ventas, tope presupuesto).
 */
export function tecnicosSedeSwitch(sedesUsu: string): TecnicosSedeConfig {
  const raw = sedesUsu.trim();
  switch (raw) {
    case '1':
      return {
        sede: 'GASOLINA',
        sedesRanking: '1,7,6,18,19',
        sedesVentasRanking: raw,
        topeRanPres: 15000000,
      };
    case '7':
      return {
        sede: 'GASOLINA',
        sedesRanking: '1,7,6,18,19',
        sedesVentasRanking: raw,
        topeRanPres: 15000000,
      };
    case '6,19':
      return {
        sede: 'GASOLINA',
        sedesRanking: '1,7,6,18,19',
        sedesVentasRanking: '6,19',
        topeRanPres: 20000000,
      };
    case '18':
      return {
        sede: 'GASOLINA',
        sedesRanking: '1,7,6,18,19',
        sedesVentasRanking: raw,
        topeRanPres: 15000000,
      };
    case '19,6':
      return {
        sede: 'DIESEL',
        sedesRanking: '11,16',
        sedesVentasRanking: '6,19',
        topeRanPres: 20000000,
      };
    case '11':
      return {
        sede: 'DIESEL',
        sedesRanking: '11,16',
        sedesVentasRanking: raw,
        topeRanPres: 24000000,
      };
    case '16':
      return {
        sede: 'DIESEL',
        sedesRanking: '11,16',
        sedesVentasRanking: '8,16',
        topeRanPres: 20000000,
      };
    case '8':
    case '16,8':
    case '8,16':
      return {
        sede: 'GASOLINA',
        sedesRanking: '1,7,6,18,19',
        sedesVentasRanking: '8,16',
        topeRanPres: 20000000,
      };
    case '21,9':
    case '9,21':
      return {
        sede: 'LYP',
        sedesRanking: '9,14,21,22',
        sedesVentasRanking: raw,
        topeRanPres: 15000000,
      };
    case '14,22':
      return {
        sede: 'LYP',
        sedesRanking: '9,14,21,22',
        sedesVentasRanking: raw,
        topeRanPres: 15000000,
      };
    default:
      return {
        sede: '',
        sedesRanking: '1,7,6,18,19',
        sedesVentasRanking: raw,
        topeRanPres: 15000000,
      };
  }
}
