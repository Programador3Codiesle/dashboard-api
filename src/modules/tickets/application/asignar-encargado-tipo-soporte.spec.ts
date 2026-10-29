import {
  NIT_ENCARGADO_DMS,
  NIT_ENCARGADO_POSTVENTA,
  NIT_ENCARGADO_POSTVENTA_LEGACY,
  NIT_ENCARGADO_SOPORTE,
  NIT_ENCARGADO_SOPORTE_LEGACY,
  NIT_ENCARGADO_VENTAS,
  NOMBRE_ENCARGADO_POSTVENTA,
  NOMBRE_ENCARGADO_SOPORTE,
  asignarEncargadoPorTipoSoporte,
  nombreEncargadoVisible,
} from './asignar-encargado-tipo-soporte';
import { areaTicketsPorNit } from './area-tickets-por-nit';
import { esPerfilStaffTickets } from './perfiles-tickets';

describe('asignarEncargadoPorTipoSoporte', () => {
  it('Hardware/Software/Toner → Jorge Jaimes (reemplaza a Edwin)', () => {
    expect(asignarEncargadoPorTipoSoporte('Software')).toEqual({
      encargadoNit: NIT_ENCARGADO_SOPORTE,
      area: 'sistemas',
    });
    expect(NIT_ENCARGADO_SOPORTE).toBe(1095935528);
    expect(NIT_ENCARGADO_SOPORTE_LEGACY).toBe(1102368016);
  });

  it('CRM Comercial → Tunjano', () => {
    expect(asignarEncargadoPorTipoSoporte('CRM Comercial')?.encargadoNit).toBe(
      NIT_ENCARGADO_VENTAS,
    );
  });

  it('CRM PosVenta → Cristhian (reemplaza a Andrés)', () => {
    expect(asignarEncargadoPorTipoSoporte('CRM PosVenta')).toEqual({
      encargadoNit: NIT_ENCARGADO_POSTVENTA,
      area: 'sistemas',
    });
    expect(NIT_ENCARGADO_POSTVENTA).toBe(1095944273);
  });

  it('DMS → Nathalia', () => {
    expect(asignarEncargadoPorTipoSoporte('DMS')?.encargadoNit).toBe(
      NIT_ENCARGADO_DMS,
    );
  });
});

describe('nombreEncargadoVisible', () => {
  it('Andrés Gómez (NIT legado) se muestra como Cristhian', () => {
    expect(
      nombreEncargadoVisible(
        NIT_ENCARGADO_POSTVENTA_LEGACY,
        'GOMEZ RUBIO CARLOS ANDRES',
      ),
    ).toBe(NOMBRE_ENCARGADO_POSTVENTA);
  });

  it('Cristhian usa el nombre canónico de PosVenta', () => {
    expect(nombreEncargadoVisible(NIT_ENCARGADO_POSTVENTA, 'OTRO')).toBe(
      NOMBRE_ENCARGADO_POSTVENTA,
    );
  });

  it('Edwin Tami se muestra como Jorge Jaimes', () => {
    expect(
      nombreEncargadoVisible(
        NIT_ENCARGADO_SOPORTE_LEGACY,
        'RAMIREZ TAMI EDWIN',
      ),
    ).toBe(NOMBRE_ENCARGADO_SOPORTE);
  });

  it('otros encargados conservan el nombre de terceros', () => {
    expect(
      nombreEncargadoVisible(
        NIT_ENCARGADO_VENTAS,
        'TUNJANO DIAZ CRISTIAN CAMILO',
      ),
    ).toBe('TUNJANO DIAZ CRISTIAN CAMILO');
  });
});

describe('areaTicketsPorNit', () => {
  it('Cristhian es sistemas (Finalizados)', () => {
    expect(areaTicketsPorNit(1095944273)).toBe('sistemas');
  });

  it('Jorge Jaimes es sistemas (reemplaza a Edwin)', () => {
    expect(areaTicketsPorNit(1095935528)).toBe('sistemas');
    expect(areaTicketsPorNit(NIT_ENCARGADO_SOPORTE_LEGACY)).toBe('sistemas');
  });

  it('NIT desconocido → otro', () => {
    expect(areaTicketsPorNit(1)).toBe('otro');
  });
});

describe('esPerfilStaffTickets', () => {
  it('Developer 20 es staff', () => {
    expect(esPerfilStaffTickets(20)).toBe(true);
  });

  it('perfil ajeno no es staff', () => {
    expect(esPerfilStaffTickets(31)).toBe(false);
    expect(esPerfilStaffTickets(62)).toBe(false);
    expect(esPerfilStaffTickets(26)).toBe(false);
  });
});
