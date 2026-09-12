export const PERFIL_ADMIN = 1;
export const PERFIL_DEVELOPER = 20;
export const LEGACY_MASTER_PASSWORD = '123456';

/** Codiesel. Login PHP es monoempresa; sin fila en sw_empresa_usuario se asigna esta. */
export const CODIESEL_EMPRESA_ID = 1;

/** Intranet ventas: Login.php validar_usu where_not_in. */
export const FID_PERFIL_VENTAS_BLOQUEADOS = [51, 53, 54] as const;

export const PASSWORD_CHANGE_JWT_PURPOSE = 'password_change';

export const AUTH_MESSAGES = {
  usuarioNoNumerico: 'El campo usuario debe ser un numero',
  usuarioNoEncontrado: 'Problemas al consultar el usuario',
  usuarioInactivo: 'El usuario esta inactivo',
  passwordNoCoincide: 'La contraseña no coincide',
  passwordsNoCoinciden: 'Las contraseñas no coinciden',
  passwordActualizada: 'Contraseña actualizada con exito',
  datosInvalidos: 'Problemas con los datos enviados',
  passwordDebil:
    'La contraseña debe tener al menos una letra mayuscula, una minuscula, un numero y un caracter especial',
  recuperarError: 'La cedula es incorrecta o no tienes correo corporativo',
  codigoIncorrecto: 'El codigo es incorrecto',
} as const;

export function jwtSubjectToString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}
