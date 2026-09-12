export type EnvGetter = {
  get<T = string>(key: string): T | undefined;
};

export type SmtpAccount = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromAddress: string;
  fromName: string;
  accountKey: 1 | 2 | 3;
};

/** 1 Codiesel, 2 Dieselco, 3 y 4 Codinova (misma cuenta SMTP_3). */
export function smtpAccountKey(empresaId?: number | null): 1 | 2 | 3 {
  const id = Number(empresaId);
  if (id === 2) return 2;
  if (id === 3 || id === 4) return 3;
  return 1;
}

function firstNonEmpty(
  ...values: Array<string | undefined>
): string | undefined {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}

export function resolveSmtpAccount(
  config: EnvGetter,
  empresaId?: number | null,
): SmtpAccount | null {
  const accountKey = smtpAccountKey(empresaId);
  const host = firstNonEmpty(config.get('SMTP_HOST')) ?? 'smtp.gmail.com';
  const port = Number(config.get('SMTP_PORT') ?? 587);

  const prefixedUser = config.get(`SMTP_${accountKey}_USER`);
  const prefixedPass = config.get(`SMTP_${accountKey}_PASS`);
  const prefixedFrom = config.get(`SMTP_${accountKey}_FROM`);
  const prefixedName = config.get(`SMTP_${accountKey}_FROM_NAME`);

  const user =
    accountKey === 1
      ? firstNonEmpty(prefixedUser, config.get('SMTP_USER'))
      : firstNonEmpty(prefixedUser);
  const pass =
    accountKey === 1
      ? firstNonEmpty(prefixedPass, config.get('SMTP_PASS'))
      : firstNonEmpty(prefixedPass);
  const fromAddress =
    accountKey === 1
      ? firstNonEmpty(prefixedFrom, config.get('SMTP_FROM'), user)
      : firstNonEmpty(prefixedFrom, user);
  const fromName =
    accountKey === 1
      ? (firstNonEmpty(prefixedName, config.get('SMTP_FROM_NAME')) ?? '')
      : (firstNonEmpty(prefixedName) ?? '');

  if (!user || !pass || !fromAddress) {
    return null;
  }

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user,
    pass,
    fromAddress,
    fromName,
    accountKey,
  };
}
