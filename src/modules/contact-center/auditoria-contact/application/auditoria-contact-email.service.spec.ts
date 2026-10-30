import { cuerpoCorreoAuditoria } from './auditoria-contact-email.service';

describe('cuerpoCorreoAuditoria', () => {
  it('arma la tarjeta con los textos del sendEmail de CodeIgniter', () => {
    const html = cuerpoCorreoAuditoria({
      primerNombre: 'Diana',
      observacionesHtml:
        '<ol><li><strong>No Saludo: </strong>No se identificó</li></ol>',
      observacionEncargado: 'Reforzar el guion',
      enlaceListado:
        'http://localhost:3000/dashboard/contact-center/auditoria/listado',
    });

    expect(html).toContain('¡Hola Diana!');
    expect(html).toContain(
      'Tiene una nueva auditoría, acontinuación encontraras las observaciones por cada Item el cual no fue ejecutado correctamente.',
    );
    expect(html).toContain('Observaciones:');
    expect(html).toContain(
      '<li><strong>No Saludo: </strong>No se identificó</li>',
    );
    expect(html).toContain(
      '<strong>Observacion realizada por el encargado de la auditoría:</strong>',
    );
    expect(html).toContain('Reforzar el guion');
    expect(html).toContain(
      'Ingresa en el siguiente enlace para conocer a detalle la auditoría realizada, y diligenciar el compromiso para está.',
    );
    expect(html).toContain(
      'href="http://localhost:3000/dashboard/contact-center/auditoria/listado"',
    );
    expect(html).toContain('>Ver auditorías</a>');
    expect(html).toContain('background-color: #343a40');
  });
});
