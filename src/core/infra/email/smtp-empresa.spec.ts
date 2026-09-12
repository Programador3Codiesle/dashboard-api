import { resolveSmtpAccount, smtpAccountKey } from './smtp-empresa';

describe('smtpAccountKey', () => {
  it('mapea empresas 1–4 al pool SMTP', () => {
    expect(smtpAccountKey(1)).toBe(1);
    expect(smtpAccountKey(undefined)).toBe(1);
    expect(smtpAccountKey(2)).toBe(2);
    expect(smtpAccountKey(3)).toBe(3);
    expect(smtpAccountKey(4)).toBe(3);
  });
});

describe('resolveSmtpAccount', () => {
  const env: Record<string, string> = {
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_USER: 'legacy@codiesel.co',
    SMTP_PASS: 'legacy-pass',
    SMTP_FROM: 'legacy@codiesel.co',
    SMTP_FROM_NAME: 'LEGACY',
    SMTP_1_USER: 'no-reply@codiesel.co',
    SMTP_1_PASS: 'pass1',
    SMTP_1_FROM_NAME: 'CODIESEL S.A',
    SMTP_2_USER: 'no-reply@dieselco.co',
    SMTP_2_PASS: 'pass2',
    SMTP_2_FROM_NAME: 'DIESELCO S.A',
    SMTP_3_USER: 'no-reply@codinovamotor.com',
    SMTP_3_PASS: 'pass3',
    SMTP_3_FROM_NAME: 'CODINOVA S.A',
  };
  const config = {
    get: (key: string) => env[key],
  };

  it('usa SMTP_1 y cae a SMTP_USER si falta el prefijo', () => {
    const a = resolveSmtpAccount(config, 1);
    expect(a?.user).toBe('no-reply@codiesel.co');
    expect(a?.fromName).toBe('CODIESEL S.A');
    const fallback = resolveSmtpAccount(
      { get: (k: string) => (k.startsWith('SMTP_1') ? undefined : env[k]) },
      1,
    );
    expect(fallback?.user).toBe('legacy@codiesel.co');
  });

  it('Dieselco usa SMTP_2; Mitsubishi y BYD usan SMTP_3', () => {
    expect(resolveSmtpAccount(config, 2)?.user).toBe('no-reply@dieselco.co');
    expect(resolveSmtpAccount(config, 3)?.user).toBe(
      'no-reply@codinovamotor.com',
    );
    expect(resolveSmtpAccount(config, 4)?.user).toBe(
      'no-reply@codinovamotor.com',
    );
  });

  it('empresa 2 sin credenciales no usa las de Codiesel', () => {
    const onlyCodiesel = {
      get: (k: string) => (k.includes('SMTP_2') ? undefined : env[k]),
    };
    expect(resolveSmtpAccount(onlyCodiesel, 2)).toBeNull();
  });
});
