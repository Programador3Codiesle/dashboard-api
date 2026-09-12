import {
  enHorarioLaboralAusentismo,
  escapeHtmlAdmin,
} from './shared/destinos-email-admin';
import { fechaLocalYmd } from './shared/fecha-local';
import {
  MSG_ADJUNTO_AUSENTISMO,
  motivoRequiereAdjunto,
  validarAdjuntoAusentismo,
} from './shared/adjunto-ausentismo';
import {
  sedePorteriaByPerfil,
  veTodasLasHorasExtras,
} from './shared/sede-porteria';

describe('sedePorteriaByPerfil', () => {
  it('perfil 7 y 20 → Giron; 45 → Bocono; resto vacío', () => {
    expect(sedePorteriaByPerfil(7)).toBe('Giron');
    expect(sedePorteriaByPerfil('20')).toBe('Giron');
    expect(sedePorteriaByPerfil(45)).toBe('Bocono');
    expect(sedePorteriaByPerfil(1)).toBe('');
  });
});

describe('veTodasLasHorasExtras', () => {
  it('nit GH o perfil 20 ven todas', () => {
    expect(veTodasLasHorasExtras(63369607, 31)).toBe(true);
    expect(veTodasLasHorasExtras(1, 20)).toBe(true);
    expect(veTodasLasHorasExtras(1, 31)).toBe(false);
  });
});

describe('enHorarioLaboralAusentismo', () => {
  it('bloquea 6:30 y 20:00; permite 7:00', () => {
    expect(enHorarioLaboralAusentismo(new Date(2026, 0, 1, 6, 30))).toBe(false);
    expect(enHorarioLaboralAusentismo(new Date(2026, 0, 1, 20, 0))).toBe(false);
    expect(enHorarioLaboralAusentismo(new Date(2026, 0, 1, 7, 0))).toBe(true);
  });
});

describe('escapeHtmlAdmin', () => {
  it('escapa markup en nombres de correo', () => {
    expect(escapeHtmlAdmin('<b>Ana</b>')).toBe('&lt;b&gt;Ana&lt;/b&gt;');
  });
});

describe('fechaLocalYmd', () => {
  it('usa calendario local, no UTC', () => {
    const d = new Date(2026, 0, 15, 0, 0, 0);
    expect(fechaLocalYmd(d)).toBe('2026-01-15');
  });
});

describe('adjunto ausentismo', () => {
  it('exige soporte en los 5 motivos PHP', () => {
    expect(motivoRequiereAdjunto('Estudio')).toBe(true);
    expect(motivoRequiereAdjunto('Calamidad Doméstica')).toBe(true);
    expect(motivoRequiereAdjunto('Personal')).toBe(false);
  });

  it('rechaza extensión o tamaño inválido', () => {
    expect(
      validarAdjuntoAusentismo({
        originalname: 'x.exe',
        size: 10,
        mimetype: 'application/octet-stream',
      }),
    ).toBe(MSG_ADJUNTO_AUSENTISMO);
    expect(
      validarAdjuntoAusentismo({
        originalname: 'x.pdf',
        size: 6 * 1024 * 1024,
        mimetype: 'application/pdf',
      }),
    ).toBe(MSG_ADJUNTO_AUSENTISMO);
    expect(
      validarAdjuntoAusentismo({
        originalname: 'x.pdf',
        size: 100,
        mimetype: 'application/pdf',
      }),
    ).toBeNull();
  });
});
