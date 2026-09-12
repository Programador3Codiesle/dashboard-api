import {
  normalizarSedePresupuestoPac,
  sedesPresupuestoPac,
} from './sede-presupuesto-pac';

describe('normalizarSedePresupuestoPac', () => {
  it('pasa MITSUBISHI a CODINOVA', () => {
    expect(normalizarSedePresupuestoPac('MITSUBISHI')).toBe('CODINOVA');
    expect(normalizarSedePresupuestoPac('mitsubishi')).toBe('CODINOVA');
    expect(normalizarSedePresupuestoPac(' Mitsubishi ')).toBe('CODINOVA');
  });

  it('conserva CODINOVA y el resto de sedes', () => {
    expect(normalizarSedePresupuestoPac('CODINOVA')).toBe('CODINOVA');
    expect(normalizarSedePresupuestoPac('CODIESEL')).toBe('CODIESEL');
    expect(normalizarSedePresupuestoPac('DIESELCO')).toBe('DIESELCO');
    expect(normalizarSedePresupuestoPac('BYD')).toBe('BYD');
  });
});

describe('sedesPresupuestoPac', () => {
  it('en Mitsubishi busca CODINOVA y el alias MITSUBISHI', () => {
    expect(sedesPresupuestoPac(3)).toEqual(['CODINOVA', 'MITSUBISHI']);
  });

  it('en las demás empresas usa un solo nombre', () => {
    expect(sedesPresupuestoPac(1)).toEqual(['CODIESEL']);
    expect(sedesPresupuestoPac(2)).toEqual(['DIESELCO']);
    expect(sedesPresupuestoPac(4)).toEqual(['BYD']);
    expect(sedesPresupuestoPac(99)).toEqual([]);
  });
});
