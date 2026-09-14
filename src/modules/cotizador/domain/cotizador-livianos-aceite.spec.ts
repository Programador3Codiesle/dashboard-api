import { Prisma } from '@prisma/client';
import {
  ACEITE_CODIGO_DESDE_2026,
  ACEITE_CODIGO_HASTA_2025,
  sqlFiltroAceitePorAnioModelo,
} from './cotizador-livianos-aceite';

describe('sqlFiltroAceitePorAnioModelo', () => {
  it('no filtra clases distintas a ONIX/Tracker/Montana', () => {
    expect(sqlFiltroAceitePorAnioModelo('SPARK', 2026)).toBe(Prisma.empty);
  });

  it('no filtra si el año no es válido', () => {
    expect(sqlFiltroAceitePorAnioModelo('ONIX1A', 0)).toBe(Prisma.empty);
  });

  it('año 2025 excluye el aceite 2026+', () => {
    const sql = sqlFiltroAceitePorAnioModelo('ONIX1A', 2025);
    expect(sql).not.toBe(Prisma.empty);
    expect(JSON.stringify(sql)).toContain(ACEITE_CODIGO_DESDE_2026);
  });

  it('año 2026 excluye el aceite hasta 2025', () => {
    const sql = sqlFiltroAceitePorAnioModelo('MONTANA', 2026);
    expect(sql).not.toBe(Prisma.empty);
    expect(JSON.stringify(sql)).toContain(ACEITE_CODIGO_HASTA_2025);
  });
});
