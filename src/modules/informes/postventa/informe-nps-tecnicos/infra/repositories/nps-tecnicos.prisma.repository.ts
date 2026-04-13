import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  FiltrosNpsTecnicos,
  INpsTecnicosRepository,
  OrigenNpsTecnicos,
} from '../../domain/nps-tecnicos.repository';
import { NpsTecnicoRowEntity } from '../../domain/nps-tecnicos.entity';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';

type SedeFiltro = 'todas' | 'giron' | 'rosita' | 'bocono' | 'barranca';

@Injectable()
export class NpsTecnicosPrismaRepository implements INpsTecnicosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosNpsTecnicos): Promise<NpsTecnicoRowEntity[]> {
    if (filtros.origen === 'nps_int') {
      return this.listarNpsInterno(filtros);
    }

    return this.listarNpsCol(filtros);
  }

  private mapSedeToBodegas(sede: SedeFiltro): number[] {
    // Mapea igual que en el legacy (listar_nps_tec)
    switch (sede) {
      case 'giron':
        return [1, 9, 11, 21];
      case 'rosita':
        return [7];
      case 'barranca':
        return [6, 19];
      case 'bocono':
        return [8, 14, 16, 22];
      case 'todas':
      default:
        return [1, 9, 11, 21, 7, 6, 19, 8, 14, 16, 22];
    }
  }

  private getMesesArray(mes: number): number[] {
    if (!mes || mes === 0) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    return [mes];
  }

  private async listarNpsInterno(
    filtros: FiltrosNpsTecnicos,
  ): Promise<NpsTecnicoRowEntity[]> {
    const bodegas = this.mapSedeToBodegas(filtros.sede);
    const meses = this.getMesesArray(filtros.mes);

    const rows = await this.prisma.$queryRaw<
      {
        nombres: string;
        enc0a6: number | null;
        enc7a8: number | null;
        enc9a10: number | null;
        mes: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        t.nombres,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 'enc0a6' END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 'enc7A8' END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 'enc9A10' END) AS enc9a10,
        MONTH(CONVERT(DATE, teo.fecha_hora_entrega_real)) AS mes
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      WHERE MONTH(CONVERT(DATE, teo.fecha_hora_entrega_real)) IN (${Prisma.join(
        meses,
      )})
        AND teo.bodega IN (${Prisma.join(bodegas)})
      GROUP BY t.nombres, t.nit_real, pes.fecha, pes.n_orden, pes.id, MONTH(CONVERT(DATE, teo.fecha_hora_entrega_real))
    `);

    return rows.map((row) => {
      const enc0a6 = row.enc0a6 ?? 0;
      const enc7a8 = row.enc7a8 ?? 0;
      const enc9a10 = row.enc9a10 ?? 0;
      const total = enc0a6 + enc7a8 + enc9a10;
      const nps = total > 0 ? ((enc9a10 - enc0a6) / total) * 100 : 0;

      return new NpsTecnicoRowEntity({
        origen: 'nps_int',
        sede: filtros.sede,
        tecnico: row.nombres,
        nps,
        enc0a6,
        enc7a8,
        enc9a10,
        mesNumero: row.mes,
        mesNombre: this.getNombreMes(row.mes),
      });
    });
  }

  private async listarNpsCol(
    filtros: FiltrosNpsTecnicos,
  ): Promise<NpsTecnicoRowEntity[]> {
    const year = new Date().getFullYear();
    const meses = this.getMesesArray(filtros.mes);

    // Para NPS Col, el legacy tiene variantes por sede y "all".
    // Aquí usamos un único query con filtro opcional por sede.
    const sedeFiltro =
      filtros.sede === 'todas'
        ? Prisma.sql`1 = 1`
        : Prisma.sql`nt.sede = ${filtros.sede}`;

    const rows = await this.prisma.$queryRaw<
      {
        nombres: string;
        enc0a6: number | null;
        enc7a8: number | null;
        enc9a10: number | null;
        mes: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        nt.nombres,
        COUNT(CASE WHEN nt.calificacion BETWEEN 0 AND 6 THEN 'enc0a6' END) AS enc0a6,
        COUNT(CASE WHEN nt.calificacion BETWEEN 7 AND 8 THEN 'enc7a8' END) AS enc7a8,
        COUNT(CASE WHEN nt.calificacion BETWEEN 9 AND 10 THEN 'enc9a10' END) AS enc9a10,
        MONTH(CONVERT(DATE, nt.fecha_enc)) AS mes
      FROM nps_tec nt
      WHERE YEAR(CONVERT(DATE, nt.fecha_enc)) = ${year}
        AND MONTH(CONVERT(DATE, nt.fecha_enc)) IN (${Prisma.join(meses)})
        AND ${sedeFiltro}
      GROUP BY nt.nombres, MONTH(CONVERT(DATE, nt.fecha_enc))
    `);

    return rows.map((row) => {
      const enc0a6 = row.enc0a6 ?? 0;
      const enc7a8 = row.enc7a8 ?? 0;
      const enc9a10 = row.enc9a10 ?? 0;
      const total = enc0a6 + enc7a8 + enc9a10;
      const nps = total > 0 ? ((enc9a10 - enc0a6) / total) * 100 : 0;

      return new NpsTecnicoRowEntity({
        origen: 'nps_col',
        sede: filtros.sede,
        tecnico: row.nombres,
        nps,
        enc0a6,
        enc7a8,
        enc9a10,
        mesNumero: row.mes,
        mesNombre: this.getNombreMes(row.mes),
      });
    });
  }

  private getNombreMes(mes: number | null): string {
    if (!mes || mes < 1 || mes > 12) return '';
    const nombres = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return nombres[mes - 1];
  }
}
