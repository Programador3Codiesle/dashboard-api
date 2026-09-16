import {
  alcanceInformeLivianos,
  alcanceInformePesados,
} from './informe-cotizaciones-visibilidad';

describe('alcance informe cotizaciones (legacy)', () => {
  it('livianos: admin/dev/auditor ven todas; jefes/asesores por bodega; CC solo las suyas', () => {
    expect(alcanceInformeLivianos(1)).toBe('todas');
    expect(alcanceInformeLivianos(20)).toBe('todas');
    expect(alcanceInformeLivianos(54)).toBe('todas');
    expect(alcanceInformeLivianos(4)).toBe('bodega');
    expect(alcanceInformeLivianos(34)).toBe('bodega');
    expect(alcanceInformeLivianos(30)).toBe('propias');
    expect(alcanceInformeLivianos(31)).toBe('propias');
  });

  it('pesados: 54 y 4 no ven todas (a diferencia de livianos)', () => {
    expect(alcanceInformePesados(1)).toBe('todas');
    expect(alcanceInformePesados(20)).toBe('todas');
    expect(alcanceInformePesados(54)).toBe('propias');
    expect(alcanceInformePesados(4)).toBe('propias');
    expect(alcanceInformePesados(33)).toBe('bodega');
    expect(alcanceInformePesados(30)).toBe('propias');
    expect(alcanceInformePesados(31)).toBe('propias');
  });
});
