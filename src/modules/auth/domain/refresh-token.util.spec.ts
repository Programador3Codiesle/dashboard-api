import {
  isRefreshTokenUsable,
  REFRESH_REUSE_WINDOW_MS,
} from './refresh-token.util';

describe('isRefreshTokenUsable', () => {
  const now = new Date('2026-09-08T20:00:00.000Z');
  const expiresAt = new Date('2026-09-15T20:00:00.000Z');

  it('acepta un token activo no revocado', () => {
    expect(isRefreshTokenUsable(expiresAt, null, now)).toBe(true);
  });

  it('acepta un token revocado dentro de la ventana de reuso', () => {
    const revokedAt = new Date(now.getTime() - 30_000);
    expect(isRefreshTokenUsable(expiresAt, revokedAt, now)).toBe(true);
  });

  it('rechaza un token revocado fuera de la ventana de reuso', () => {
    const revokedAt = new Date(now.getTime() - REFRESH_REUSE_WINDOW_MS - 1);
    expect(isRefreshTokenUsable(expiresAt, revokedAt, now)).toBe(false);
  });

  it('rechaza un token expirado aunque no esté revocado', () => {
    const expired = new Date(now.getTime() - 1000);
    expect(isRefreshTokenUsable(expired, null, now)).toBe(false);
  });
});
