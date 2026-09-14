import { formatHoraHHmm } from './format-hora-hhmm';

describe('formatHoraHHmm', () => {
  it('deja HH:mm de 24 h', () => {
    expect(formatHoraHHmm('09:05')).toBe('09:05');
    expect(formatHoraHHmm('14:30:00')).toBe('14:30');
  });

  it('convierte 12 h AM/PM', () => {
    expect(formatHoraHHmm('02:30 PM')).toBe('14:30');
    expect(formatHoraHHmm('12:05 AM')).toBe('00:05');
    expect(formatHoraHHmm(' 3:10PM')).toBe('15:10');
  });

  it('formatea Date', () => {
    const d = new Date(2026, 8, 14, 7, 8, 0);
    expect(formatHoraHHmm(d)).toBe('07:08');
  });

  it('vacío o nulo queda vacío', () => {
    expect(formatHoraHHmm(null)).toBe('');
    expect(formatHoraHHmm('')).toBe('');
  });
});
