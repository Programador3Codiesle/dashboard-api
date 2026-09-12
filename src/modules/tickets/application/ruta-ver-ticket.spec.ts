import { rutaVerTicket } from './ruta-ver-ticket';

describe('rutaVerTicket', () => {
  const frontend = 'https://intranet.codiesel.co/postventa2';
  const legacy = 'https://intranet.codiesel.co/postventa/';

  it('fid_perfil 51–54 → listado ventas (str_replace postventa)', () => {
    expect(
      rutaVerTicket({
        fidPerfil: 51,
        frontendBaseUrl: frontend,
        legacyPostventaBaseUrl: legacy,
      }),
    ).toBe('https://intranet.codiesel.co/ventas/tickets');
    expect(
      rutaVerTicket({
        fidPerfil: '52',
        frontendBaseUrl: frontend,
        legacyPostventaBaseUrl: 'https://intranet.codiesel.co/postventa',
      }),
    ).toBe('https://intranet.codiesel.co/ventas/tickets');
  });

  it('otros perfiles → hub Next de tickets', () => {
    expect(
      rutaVerTicket({
        fidPerfil: 31,
        frontendBaseUrl: frontend,
        legacyPostventaBaseUrl: legacy,
      }),
    ).toBe('https://intranet.codiesel.co/postventa2/dashboard/tickets');
  });
});
