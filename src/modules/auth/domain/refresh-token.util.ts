export const REFRESH_REUSE_WINDOW_MS = 60_000;

export function isRefreshTokenUsable(
  expiresAt: Date,
  revokedAt: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (expiresAt.getTime() <= now.getTime()) {
    return false;
  }
  if (revokedAt == null) {
    return true;
  }
  return now.getTime() - revokedAt.getTime() <= REFRESH_REUSE_WINDOW_MS;
}
