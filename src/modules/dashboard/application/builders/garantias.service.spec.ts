import { GarantiasService } from './garantias.service';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { IGarantiasDashboardRepository } from '../../domain/garantias.repository';

describe('GarantiasService', () => {
  const sedes = [
    { idsede: 2, idsede_v: '2', descripcion: 'Rosita' },
    { idsede: 1, idsede_v: '1', descripcion: 'Girón' },
  ];

  function crear(
    ventas: Array<{
      sede: number;
      ano: number;
      mes: number;
      rptos: number;
      mo: number;
      tot: number;
      horas: number;
    }> = [],
  ) {
    const getVentasGarantia = jest.fn().mockResolvedValue(ventas);
    const getSedesUser = jest.fn().mockResolvedValue(sedes);
    const service = new GarantiasService(
      {
        getMesAnoActual: jest.fn().mockResolvedValue({ mes: 10, ano: 2026 }),
        getSedesUser,
      } as unknown as IDashboardCommonRepository,
      { getVentasGarantia } as unknown as IGarantiasDashboardRepository,
    );
    return { service, getVentasGarantia, getSedesUser };
  }

  it('rellena los meses sin venta con ceros y deja el mes elegido en las tarjetas', async () => {
    const { service } = crear([
      { sede: 1, ano: 2026, mes: 1, rptos: 10, mo: 20, tot: 5, horas: 2 },
      { sede: 1, ano: 2026, mes: 3, rptos: 1, mo: 2, tot: 3, horas: 4 },
    ]);

    const data = await service.buildGarantias(
      9,
      '2026-03-01',
      0,
      'u',
      3,
      2026,
      1,
    );

    expect(data.variant).toBe('garantias');
    expect(data.bodegas.map((b) => b.sede)).toEqual(['Girón', 'Rosita']);
    const giron = data.bodegas[0];
    expect(giron.meses).toHaveLength(3);
    expect(giron.meses[1]).toMatchObject({
      mesNom: 'Febrero',
      mo: 0,
      repuestos: 0,
      tot: 0,
      horas: 0,
      total: 0,
    });
    expect(giron).toMatchObject({
      mo: 2,
      repuestos: 1,
      tot: 3,
      horas: 4,
      total: 6,
    });
    expect(data.bodegas[1].total).toBe(0);
    expect(data.bodegas[1].meses).toHaveLength(3);
  });

  it('sin empresa no consulta ventas', async () => {
    const { service, getVentasGarantia, getSedesUser } = crear();
    const data = await service.buildGarantias(9, '2026-03-01', 0, 'u');
    expect(data.bodegas).toEqual([]);
    expect(getSedesUser).not.toHaveBeenCalled();
    expect(getVentasGarantia).not.toHaveBeenCalled();
  });

  it('sin bodegas asignadas no consulta ventas', async () => {
    const { service, getVentasGarantia, getSedesUser } = crear();
    getSedesUser.mockResolvedValue([]);
    const data = await service.buildGarantias(
      9,
      '2026-03-01',
      0,
      'u',
      3,
      2026,
      2,
    );
    expect(data.bodegas).toEqual([]);
    expect(getVentasGarantia).not.toHaveBeenCalled();
  });
});
