import {
  DESTINATARIOS_AUTORIZACION_COMPRAS,
  DESTINATARIOS_NUEVA_SOLICITUD_COMPRAS,
  parseListaEmails,
} from './destinos-email-compras';

describe('parseListaEmails', () => {
  it('usa el fallback legacy si el env está vacío', () => {
    expect(
      parseListaEmails(undefined, DESTINATARIOS_AUTORIZACION_COMPRAS),
    ).toEqual([
      'personal@codiesel.co',
      'gerencia@codiesel.co',
      'ger.servicio@codiesel.co',
    ]);
    expect(
      parseListaEmails('  ', DESTINATARIOS_NUEVA_SOLICITUD_COMPRAS),
    ).toEqual(['compras@codiesel.co']);
  });

  it('respeta override por coma', () => {
    expect(
      parseListaEmails(
        'programador3@codiesel.co,  otro@codiesel.co',
        DESTINATARIOS_AUTORIZACION_COMPRAS,
      ),
    ).toEqual(['programador3@codiesel.co', 'otro@codiesel.co']);
  });
});
