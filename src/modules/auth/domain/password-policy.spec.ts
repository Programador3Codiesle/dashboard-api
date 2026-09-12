import {
  isNuevaPasswordValida,
  storedPasswordRequiresChange,
} from './password-policy';

describe('password-policy', () => {
  it('fuerza cambio si la clave es el NIT o es débil', () => {
    expect(storedPasswordRequiresChange('1098765432', 1098765432)).toBe(true);
    expect(storedPasswordRequiresChange('abc', 1)).toBe(true);
    expect(storedPasswordRequiresChange('Abcdef1@', 1)).toBe(false);
    expect(storedPasswordRequiresChange('Abcdef1#_', 1)).toBe(false);
  });

  it('en updatePass no admite NIT ni símbolos extra del login', () => {
    expect(isNuevaPasswordValida('1098765432', 1098765432)).toBe(false);
    expect(isNuevaPasswordValida('Abcdef1#_', 1)).toBe(false);
    expect(isNuevaPasswordValida('Abcdef1@', 1)).toBe(true);
  });
});
