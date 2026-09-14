import { esAdminContactCenter } from './cc-permisos';

describe('esAdminContactCenter', () => {
  it('perfiles 1, 20 y 54 son admin', () => {
    expect(esAdminContactCenter(1)).toBe(true);
    expect(esAdminContactCenter(20)).toBe(true);
    expect(esAdminContactCenter(54)).toBe(true);
  });

  it('NIT 37542439 es admin aunque el perfil no lo sea', () => {
    expect(esAdminContactCenter(31, 37542439)).toBe(true);
    expect(esAdminContactCenter(31, '37542439')).toBe(true);
  });

  it('otro NIT con perfil de agente no es admin', () => {
    expect(esAdminContactCenter(31, 1098679322)).toBe(false);
  });
});
