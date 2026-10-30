import { botonGestionarSolicitud } from './entradas-varias-email.service';

describe('botonGestionarSolicitud', () => {
  it('apunta a la solicitud en el listado de la app', () => {
    const html = botonGestionarSolicitud(
      'http://localhost:3000/dashboard/repuestos/solicitudes-ev?id_solicitud=15',
    );

    expect(html).toContain('Gestionar Solicitud');
    expect(html).toContain(
      'href="http://localhost:3000/dashboard/repuestos/solicitudes-ev?id_solicitud=15"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('background-color:#f59e0b');
    expect(html).not.toContain('border:1px solid #000000');
  });
});
