import {
  nombreAdjuntoTicket,
  rutaDiscoAdjuntoNueva,
  urlAdjuntoLegado,
  urlAdjuntoNuevaApp,
} from './adjunto-ticket';

describe('nombreAdjuntoTicket', () => {
  it('acepta nombre legado', () => {
    expect(
      nombreAdjuntoTicket('Captura_de_pantalla_2026-08-12_110405.png'),
    ).toBe('Captura_de_pantalla_2026-08-12_110405.png');
  });

  it('acepta ruta Nest /uploads/tickets/', () => {
    expect(
      nombreAdjuntoTicket('/uploads/tickets/1789391050655_icono-1.jpg'),
    ).toBe('1789391050655_icono-1.jpg');
  });

  it('acepta URL absoluta', () => {
    expect(
      nombreAdjuntoTicket(
        'https://intranet.codiesel.co/postventa2/api/uploads/tickets/1789391050655_icono-1.jpg',
      ),
    ).toBe('1789391050655_icono-1.jpg');
  });

  it('rechaza path traversal', () => {
    expect(nombreAdjuntoTicket('../etc/passwd')).toBeNull();
    expect(nombreAdjuntoTicket('/uploads/tickets/../../x.png')).toBeNull();
  });
});

describe('urls adjunto', () => {
  it('nueva en localhost', () => {
    expect(urlAdjuntoNuevaApp('http://localhost:4000', 'a.jpg')).toBe(
      'http://localhost:4000/uploads/tickets/a.jpg',
    );
  });

  it('nueva en producción /postventa2/api', () => {
    expect(
      urlAdjuntoNuevaApp(
        'https://intranet.codiesel.co/postventa2/api',
        '1789391050655_icono-1.jpg',
      ),
    ).toBe(
      'https://intranet.codiesel.co/postventa2/api/uploads/tickets/1789391050655_icono-1.jpg',
    );
  });

  it('legado en localhost', () => {
    expect(
      urlAdjuntoLegado(
        'http://localhost:8080/postventa/',
        'Captura_de_pantalla_2026-08-12_110405.png',
      ),
    ).toBe(
      'http://localhost:8080/postventa/public/tickets/Captura_de_pantalla_2026-08-12_110405.png',
    );
  });

  it('legado en producción /postventa', () => {
    expect(
      urlAdjuntoLegado(
        'https://intranet.codiesel.co/postventa/',
        'Captura_de_pantalla_2026-08-12_110405.png',
      ),
    ).toBe(
      'https://intranet.codiesel.co/postventa/public/tickets/Captura_de_pantalla_2026-08-12_110405.png',
    );
  });

  it('ruta disco bajo public/uploads/tickets', () => {
    const p = rutaDiscoAdjuntoNueva('/app', 'a.jpg');
    expect(p.replace(/\\/g, '/')).toMatch(
      /\/public\/uploads\/tickets\/a\.jpg$/,
    );
  });
});
