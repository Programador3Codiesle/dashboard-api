import { Workbook } from 'exceljs';
import { ExportarTiempoSuplementarioExcelUseCase } from './exportar-tiempo-suplementario-excel.usecase';
import { InformeTiempoSuplementarioEntity } from '../../domain/informe-tiempo-suplementario.entity';
import type { ListarTiempoSuplementarioUseCase } from './listar-tiempo-suplementario.usecase';
import type { SesionInformeHe } from '../../domain/informe-tiempo-suplementario.repository';

const SESION: SesionInformeHe = { nit: 1, perfil: 1 };

describe('ExportarTiempoSuplementarioExcelUseCase', () => {
  it('escribe hora militar y el recargo nocturno como texto', async () => {
    const listar = {
      execute: () =>
        Promise.resolve([
          new InformeTiempoSuplementarioEntity({
            nombre_jefe: 'Jefe',
            nombre_empleado: 'Pepito Perez',
            sede: 'Bogotá',
            area: 'Taller',
            cargo: 'Técnico',
            fecha: '2026-10-28',
            hora_ini: '3:00 PM',
            hora_fin: '9:00 PM',
            descripcion: 'Cierre',
            estado: 1,
          }),
        ]),
    } as unknown as ListarTiempoSuplementarioUseCase;

    const buffer = await new ExportarTiempoSuplementarioExcelUseCase(
      listar,
    ).execute(undefined, SESION);

    const wb = new Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet('Tiempo suplementario');
    expect(ws).toBeDefined();

    const headers = [7, 8, 9, 10].map(
      (col) => ws!.getRow(1).getCell(col).value,
    );
    expect(headers).toEqual([
      'Hora de Inicio',
      'Hora de salida',
      'Hora de Inicio Nocturna',
      'Hora de Salida Nocturna',
    ]);

    const fila = ws!.getRow(2);
    expect(fila.getCell(7).value).toBe('15:00');
    expect(fila.getCell(8).value).toBe('18:59');
    expect(fila.getCell(9).value).toBe('19:00');
    expect(fila.getCell(10).value).toBe('21:00');
    expect(fila.getCell(7).numFmt).toBe('@');
    expect(fila.getCell(10).numFmt).toBe('@');
  });
});
