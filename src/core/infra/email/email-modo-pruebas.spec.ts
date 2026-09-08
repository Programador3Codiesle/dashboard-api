import { parseEmailModoPruebas } from './email-modo-pruebas';

describe('parseEmailModoPruebas', () => {
  it('respeta true aunque NODE_ENV sea production', () => {
    expect(parseEmailModoPruebas('true', 'production')).toBe(true);
    expect(parseEmailModoPruebas('1', 'production')).toBe(true);
    expect(parseEmailModoPruebas('si', 'production')).toBe(true);
  });

  it('respeta false aunque NODE_ENV sea development', () => {
    expect(parseEmailModoPruebas('false', 'development')).toBe(false);
    expect(parseEmailModoPruebas('0', 'development')).toBe(false);
  });

  it('si el flag se omite, redirige fuera de production', () => {
    expect(parseEmailModoPruebas(undefined, 'development')).toBe(true);
    expect(parseEmailModoPruebas('', 'test')).toBe(true);
    expect(parseEmailModoPruebas(undefined, 'production')).toBe(false);
  });
});
