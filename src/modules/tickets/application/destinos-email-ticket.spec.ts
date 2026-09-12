import {
  EMAIL_TICKET_FALLBACK,
  destinatarioCorreoRespuestaTicket,
} from './destinos-email-ticket';

describe('destinatarioCorreoRespuestaTicket', () => {
  const correos = {
    correoUsuario: 'creador@codiesel.co',
    correoEncargado: 'encargado@codiesel.co',
  };

  it('staff cierra o responde (no es el creador) → correo del creador', () => {
    expect(
      destinatarioCorreoRespuestaTicket({
        responderNit: 1102368016,
        usuarioId: 1095944273,
        ...correos,
      }),
    ).toBe('creador@codiesel.co');
  });

  it('el creador responde → correo del encargado', () => {
    expect(
      destinatarioCorreoRespuestaTicket({
        responderNit: 1095944273,
        usuarioId: 1095944273,
        ...correos,
      }),
    ).toBe('encargado@codiesel.co');
  });

  it('staff aunque no sea el encargado → sigue al creador', () => {
    expect(
      destinatarioCorreoRespuestaTicket({
        responderNit: 1,
        usuarioId: 2,
        ...correos,
      }),
    ).toBe('creador@codiesel.co');
  });

  it('creador sin mail → fallback programador3', () => {
    expect(
      destinatarioCorreoRespuestaTicket({
        responderNit: 1,
        usuarioId: 2,
        correoUsuario: '  ',
        correoEncargado: 'encargado@codiesel.co',
      }),
    ).toBe(EMAIL_TICKET_FALLBACK);
  });
});
