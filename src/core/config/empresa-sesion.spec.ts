import { readEmpresaIdFromCookie } from './empresa-sesion';

describe('readEmpresaIdFromCookie', () => {
  it('lee empresa de cookie JSON y de cookie URI-encoded', () => {
    expect(readEmpresaIdFromCookie({ user: '{"empresa":2}' })).toBe(2);
    expect(
      readEmpresaIdFromCookie({
        user: encodeURIComponent(JSON.stringify({ empresa: 4 })),
      }),
    ).toBe(4);
  });

  it('ignora cookie ausente o inválida', () => {
    expect(readEmpresaIdFromCookie(undefined)).toBeUndefined();
    expect(readEmpresaIdFromCookie({})).toBeUndefined();
    expect(readEmpresaIdFromCookie({ user: 'no-json' })).toBeUndefined();
    expect(readEmpresaIdFromCookie({ user: '{"empresa":0}' })).toBeUndefined();
  });
});
