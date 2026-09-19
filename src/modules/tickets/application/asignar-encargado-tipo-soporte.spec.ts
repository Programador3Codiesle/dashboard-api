import {
  NIT_ENCARGADO_DMS,
  NIT_ENCARGADO_POSTVENTA,
  NIT_ENCARGADO_POSTVENTA_LEGACY,
  NIT_ENCARGADO_SOPORTE,
  NIT_ENCARGADO_VENTAS,
  NOMBRE_ENCARGADO_POSTVENTA,
  asignarEncargadoPorTipoSoporte,
  nombreEncargadoVisible,
} from './asignar-encargado-tipo-soporte';
import { areaTicketsPorNit } from './area-tickets-por-nit';
import { esPerfilStaffTickets } from './perfiles-tickets';

describe('asignarEncargadoPorTipoSoporte', () => {
  it('Hardware/Software/Toner → Edwin (soporte)', () => {
    expect(asignarEncargadoPorTipoSoporte('Software')?.encargadoNit).toBe(
      NIT_ENCARGADO_SOPORTE,
    );
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

  it('otros encargados conservan el nombre de terceros', () => {
    expect(
      nombreEncargadoVisible(NIT_ENCARGADO_SOPORTE, 'RAMIREZ TAMI EDWIN'),
    ).toBe('RAMIREZ TAMI EDWIN');
  });
});

describe('areaTicketsPorNit', () => {
  it('Cristhian es sistemas (Finalizados)', () => {
    expect(areaTicketsPorNit(1095944273)).toBe('sistemas');
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
  });
});
