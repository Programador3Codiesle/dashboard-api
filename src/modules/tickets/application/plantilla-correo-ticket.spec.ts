import {
  htmlRespuestasTicket,
  plantillaCorreoTicket,
} from './plantilla-correo-ticket';

describe('plantillaCorreoTicket', () => {
  it('copia el pie y el link Ver Ticket de plantillaCorreo.php', () => {
    const html = plantillaCorreoTicket({
      asunto: 'Toner agotado',
      respuestasHtml: '<div>x</div>',
      rutaTicket: 'https://intranet.codiesel.co/postventa2/dashboard/tickets',
    });
    expect(html).toContain('Toner agotado');
    expect(html).toContain(
      'Este correo es solo de carácter informativo. Por favor, no responda a este mensaje.',
    );
    expect(html).toContain('Ver Ticket');
    expect(html).toContain(
      'href="https://intranet.codiesel.co/postventa2/dashboard/tickets"',
    );
  });
});

describe('htmlRespuestasTicket', () => {
  it('escapa cada respuesta y arma cards como PHP', () => {
    const html = htmlRespuestasTicket('ANA: hola,<script>', (v) =>
      v.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    );
    expect(html).toContain('ANA: hola');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
