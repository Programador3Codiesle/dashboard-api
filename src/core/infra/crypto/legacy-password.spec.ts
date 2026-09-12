import {
  decryptLegacyPassword,
  encryptLegacyPassword,
  md5Hex,
} from './legacy-password';

describe('legacy-password', () => {
  it('cifra y descifra round-trip', () => {
    const plain = 'Clave1@x';
    const encoded = encryptLegacyPassword(plain);
    expect(decryptLegacyPassword(encoded)).toBe(plain);
  });

  it('md5 hex tiene 32 caracteres', () => {
    expect(md5Hex('abc')).toHaveLength(32);
  });
});
