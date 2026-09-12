/**
 * Regex del gate de login (Login.php startSesion).
 * PHP: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.\#\-\_\+])[A-Za-z\d@$!%*?&.\#\-\_\+]{8,}$/x
 */
export const LOGIN_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#\-+_])[A-Za-z\d@$!%*?&.#\-+_]{8,}$/;

/**
 * Regex del formulario updatePass (js/utils/updatePassword.js). Más estricto:
 * no admite # - _ +.
 */
export const UPDATE_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

export function storedPasswordRequiresChange(
  plain: string,
  nit: number,
): boolean {
  if (plain === String(nit)) return true;
  return !LOGIN_PASSWORD_REGEX.test(plain);
}

export function isNuevaPasswordValida(plain: string, nit: number): boolean {
  if (plain === String(nit)) return false;
  return UPDATE_PASSWORD_REGEX.test(plain);
}
