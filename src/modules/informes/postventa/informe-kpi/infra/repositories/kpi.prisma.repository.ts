import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  IKpiRepository,
} from '../../domain/kpi.repository';
import {
  KpiResumenEntity,
  KpiSedeMensualEntity,
  KpiTecnicoDetalladoEntity,
  KpiTecnicoMensualEntity,
} from '../../domain/kpi.entity';

@Injectable()
export class KpiPrismaRepository implements IKpiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(): Promise<KpiResumenEntity> {
    const mantPrevRows = await this.prisma.$queryRaw<
      {
        Sede: string;
        enero: number | null;
        febrero: number | null;
        marzo: number | null;
        abril: number | null;
        mayo: number | null;
        junio: number | null;
        julio: number | null;
        agosto: number | null;
        septiembre: number | null;
        octubre: number | null;
        noviembre: number | null;
        diciembre: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        Sede,
        SUM(x.enero) AS enero,
        SUM(x.febrero) AS febrero,
        SUM(x.marzo) AS marzo,
        SUM(x.abril) AS abril,
        SUM(x.mayo) AS mayo,
        SUM(x.junio) AS junio,
        SUM(x.julio) AS julio,
        SUM(x.agosto) AS agosto,
        SUM(x.septiembre) AS septiembre,
        SUM(x.octubre) AS octubre,
        SUM(x.noviembre) AS noviembre,
        SUM(x.diciembre) AS diciembre
      FROM (
        SELECT
          descripcion AS Sede,
          CASE WHEN mes = 1 THEN ordenes ELSE 0 END AS enero,
          CASE WHEN mes = 2 THEN ordenes ELSE 0 END AS febrero,
          CASE WHEN mes = 3 THEN ordenes ELSE 0 END AS marzo,
          CASE WHEN mes = 4 THEN ordenes ELSE 0 END AS abril,
          CASE WHEN mes = 5 THEN ordenes ELSE 0 END AS mayo,
          CASE WHEN mes = 6 THEN ordenes ELSE 0 END AS junio,
          CASE WHEN mes = 7 THEN ordenes ELSE 0 END AS julio,
          CASE WHEN mes = 8 THEN ordenes ELSE 0 END AS agosto,
          CASE WHEN mes = 9 THEN ordenes ELSE 0 END AS septiembre,
          CASE WHEN mes = 10 THEN ordenes ELSE 0 END AS octubre,
          CASE WHEN mes = 11 THEN ordenes ELSE 0 END AS noviembre,
          CASE WHEN mes = 12 THEN ordenes ELSE 0 END AS diciembre
        FROM v_kpi_ot_mto
      ) x
      GROUP BY x.Sede
    `);

    const cargoCliRows = await this.prisma.$queryRaw<
      {
        Sede: string;
        enero: number | null;
        febrero: number | null;
        marzo: number | null;
        abril: number | null;
        mayo: number | null;
        junio: number | null;
        julio: number | null;
        agosto: number | null;
        septiembre: number | null;
        octubre: number | null;
        noviembre: number | null;
        diciembre: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        Sede,
        SUM(x.enero) AS enero,
        SUM(x.febrero) AS febrero,
        SUM(x.marzo) AS marzo,
        SUM(x.abril) AS abril,
        SUM(x.mayo) AS mayo,
        SUM(x.junio) AS junio,
        SUM(x.julio) AS julio,
        SUM(x.agosto) AS agosto,
        SUM(x.septiembre) AS septiembre,
        SUM(x.octubre) AS octubre,
        SUM(x.noviembre) AS noviembre,
        SUM(x.diciembre) AS diciembre
      FROM (
        SELECT
          descripcion AS Sede,
          CASE WHEN mes = 1 THEN ot ELSE 0 END AS enero,
          CASE WHEN mes = 2 THEN ot ELSE 0 END AS febrero,
          CASE WHEN mes = 3 THEN ot ELSE 0 END AS marzo,
          CASE WHEN mes = 4 THEN ot ELSE 0 END AS abril,
          CASE WHEN mes = 5 THEN ot ELSE 0 END AS mayo,
          CASE WHEN mes = 6 THEN ot ELSE 0 END AS junio,
          CASE WHEN mes = 7 THEN ot ELSE 0 END AS julio,
          CASE WHEN mes = 8 THEN ot ELSE 0 END AS agosto,
          CASE WHEN mes = 9 THEN ot ELSE 0 END AS septiembre,
          CASE WHEN mes = 10 THEN ot ELSE 0 END AS octubre,
          CASE WHEN mes = 11 THEN ot ELSE 0 END AS noviembre,
          CASE WHEN mes = 12 THEN ot ELSE 0 END AS diciembre
        FROM v_kpi_ot_cliente
      ) x
      GROUP BY x.Sede
    `);

    const otRows = await this.prisma.$queryRaw<
      {
        operario: string;
        tecnico: string;
        enero: number | null;
        febrero: number | null;
        marzo: number | null;
        abril: number | null;
        mayo: number | null;
        junio: number | null;
        julio: number | null;
        agosto: number | null;
        septiembre: number | null;
        octubre: number | null;
        noviembre: number | null;
        diciembre: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        operario,
        tecnico,
        SUM(x.enero) AS enero,
        SUM(x.febrero) AS febrero,
        SUM(x.marzo) AS marzo,
        SUM(x.abril) AS abril,
        SUM(x.mayo) AS mayo,
        SUM(x.junio) AS junio,
        SUM(x.julio) AS julio,
        SUM(x.agosto) AS agosto,
        SUM(x.septiembre) AS septiembre,
        SUM(x.octubre) AS octubre,
        SUM(x.noviembre) AS noviembre,
        SUM(x.diciembre) AS diciembre
      FROM (
        SELECT
          operario,
          tecnico,
          CASE WHEN mes = 1 THEN ot ELSE 0 END AS enero,
          CASE WHEN mes = 2 THEN ot ELSE 0 END AS febrero,
          CASE WHEN mes = 3 THEN ot ELSE 0 END AS marzo,
          CASE WHEN mes = 4 THEN ot ELSE 0 END AS abril,
          CASE WHEN mes = 5 THEN ot ELSE 0 END AS mayo,
          CASE WHEN mes = 6 THEN ot ELSE 0 END AS junio,
          CASE WHEN mes = 7 THEN ot ELSE 0 END AS julio,
          CASE WHEN mes = 8 THEN ot ELSE 0 END AS agosto,
          CASE WHEN mes = 9 THEN ot ELSE 0 END AS septiembre,
          CASE WHEN mes = 10 THEN ot ELSE 0 END AS octubre,
          CASE WHEN mes = 11 THEN ot ELSE 0 END AS noviembre,
          CASE WHEN mes = 12 THEN ot ELSE 0 END AS diciembre
        FROM v_kpi_factur_tecnico
      ) x
      GROUP BY x.operario, x.tecnico
    `);

    const repRows = await this.prisma.$queryRaw<
      {
        operario: string;
        tecnico: string;
        enero: number | null;
        febrero: number | null;
        marzo: number | null;
        abril: number | null;
        mayo: number | null;
        junio: number | null;
        julio: number | null;
        agosto: number | null;
        septiembre: number | null;
        octubre: number | null;
        noviembre: number | null;
        diciembre: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        operario,
        tecnico,
        CONVERT(INT, SUM(x.enero)) AS enero,
        CONVERT(INT, SUM(x.febrero)) AS febrero,
        CONVERT(INT, SUM(x.marzo)) AS marzo,
        CONVERT(INT, SUM(x.abril)) AS abril,
        CONVERT(INT, SUM(x.mayo)) AS mayo,
        CONVERT(INT, SUM(x.junio)) AS junio,
        CONVERT(INT, SUM(x.julio)) AS julio,
        CONVERT(INT, SUM(x.agosto)) AS agosto,
        CONVERT(INT, SUM(x.septiembre)) AS septiembre,
        CONVERT(INT, SUM(x.octubre)) AS octubre,
        CONVERT(INT, SUM(x.noviembre)) AS noviembre,
        CONVERT(INT, SUM(x.diciembre)) AS diciembre
      FROM (
        SELECT
          operario,
          tecnico,
          CASE WHEN mes = 1 THEN repuestos ELSE 0 END AS enero,
          CASE WHEN mes = 2 THEN repuestos ELSE 0 END AS febrero,
          CASE WHEN mes = 3 THEN repuestos ELSE 0 END AS marzo,
          CASE WHEN mes = 4 THEN repuestos ELSE 0 END AS abril,
          CASE WHEN mes = 5 THEN repuestos ELSE 0 END AS mayo,
          CASE WHEN mes = 6 THEN repuestos ELSE 0 END AS junio,
          CASE WHEN mes = 7 THEN repuestos ELSE 0 END AS julio,
          CASE WHEN mes = 8 THEN repuestos ELSE 0 END AS agosto,
          CASE WHEN mes = 9 THEN repuestos ELSE 0 END AS septiembre,
          CASE WHEN mes = 10 THEN repuestos ELSE 0 END AS octubre,
          CASE WHEN mes = 11 THEN repuestos ELSE 0 END AS noviembre,
          CASE WHEN mes = 12 THEN repuestos ELSE 0 END AS diciembre
        FROM v_kpi_factur_tecnico
      ) x
      GROUP BY x.operario, x.tecnico
    `);

    const moRows = await this.prisma.$queryRaw<
      {
        operario: string;
        tecnico: string;
        enero: number | null;
        febrero: number | null;
        marzo: number | null;
        abril: number | null;
        mayo: number | null;
        junio: number | null;
        julio: number | null;
        agosto: number | null;
        septiembre: number | null;
        octubre: number | null;
        noviembre: number | null;
        diciembre: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        operario,
        tecnico,
        CONVERT(INT, SUM(x.enero)) AS enero,
        CONVERT(INT, SUM(x.febrero)) AS febrero,
        CONVERT(INT, SUM(x.marzo)) AS marzo,
        CONVERT(INT, SUM(x.abril)) AS abril,
        CONVERT(INT, SUM(x.mayo)) AS mayo,
        CONVERT(INT, SUM(x.junio)) AS junio,
        CONVERT(INT, SUM(x.julio)) AS julio,
        CONVERT(INT, SUM(x.agosto)) AS agosto,
        CONVERT(INT, SUM(x.septiembre)) AS septiembre,
        CONVERT(INT, SUM(x.octubre)) AS octubre,
        CONVERT(INT, SUM(x.noviembre)) AS noviembre,
        CONVERT(INT, SUM(x.diciembre)) AS diciembre
      FROM (
        SELECT
          operario,
          tecnico,
          CASE WHEN mes = 1 THEN mano_obra ELSE 0 END AS enero,
          CASE WHEN mes = 2 THEN mano_obra ELSE 0 END AS febrero,
          CASE WHEN mes = 3 THEN mano_obra ELSE 0 END AS marzo,
          CASE WHEN mes = 4 THEN mano_obra ELSE 0 END AS abril,
          CASE WHEN mes = 5 THEN mano_obra ELSE 0 END AS mayo,
          CASE WHEN mes = 6 THEN mano_obra ELSE 0 END AS junio,
          CASE WHEN mes = 7 THEN mano_obra ELSE 0 END AS julio,
          CASE WHEN mes = 8 THEN mano_obra ELSE 0 END AS agosto,
          CASE WHEN mes = 9 THEN mano_obra ELSE 0 END AS septiembre,
          CASE WHEN mes = 10 THEN mano_obra ELSE 0 END AS octubre,
          CASE WHEN mes = 11 THEN mano_obra ELSE 0 END AS noviembre,
          CASE WHEN mes = 12 THEN mano_obra ELSE 0 END AS diciembre
        FROM v_kpi_factur_tecnico
      ) x
      GROUP BY x.operario, x.tecnico
    `);

    const mantPrev = mantPrevRows.map(
      (r) =>
        new KpiSedeMensualEntity({
          sede: r.Sede,
          enero: r.enero ?? 0,
          febrero: r.febrero ?? 0,
          marzo: r.marzo ?? 0,
          abril: r.abril ?? 0,
          mayo: r.mayo ?? 0,
          junio: r.junio ?? 0,
          julio: r.julio ?? 0,
          agosto: r.agosto ?? 0,
          septiembre: r.septiembre ?? 0,
          octubre: r.octubre ?? 0,
          noviembre: r.noviembre ?? 0,
          diciembre: r.diciembre ?? 0,
        }),
    );

    const cargoCli = cargoCliRows.map(
      (r) =>
        new KpiSedeMensualEntity({
          sede: r.Sede,
          enero: r.enero ?? 0,
          febrero: r.febrero ?? 0,
          marzo: r.marzo ?? 0,
          abril: r.abril ?? 0,
          mayo: r.mayo ?? 0,
          junio: r.junio ?? 0,
          julio: r.julio ?? 0,
          agosto: r.agosto ?? 0,
          septiembre: r.septiembre ?? 0,
          octubre: r.octubre ?? 0,
          noviembre: r.noviembre ?? 0,
          diciembre: r.diciembre ?? 0,
        }),
    );

    const byOperario = new Map<
      string,
      {
        tecnico: string;
        ot: KpiTecnicoMensualEntity;
        repuestos: KpiTecnicoMensualEntity | null;
        manoObra: KpiTecnicoMensualEntity | null;
      }
    >();

    const toMensual = (r: any) =>
      new KpiTecnicoMensualEntity({
        operario: r.operario,
        tecnico: r.tecnico,
        enero: r.enero ?? 0,
        febrero: r.febrero ?? 0,
        marzo: r.marzo ?? 0,
        abril: r.abril ?? 0,
        mayo: r.mayo ?? 0,
        junio: r.junio ?? 0,
        julio: r.julio ?? 0,
        agosto: r.agosto ?? 0,
        septiembre: r.septiembre ?? 0,
        octubre: r.octubre ?? 0,
        noviembre: r.noviembre ?? 0,
        diciembre: r.diciembre ?? 0,
      });

    for (const r of otRows) {
      byOperario.set(r.operario, {
        tecnico: r.tecnico,
        ot: toMensual(r),
        repuestos: null,
        manoObra: null,
      });
    }

    for (const r of repRows) {
      const existing = byOperario.get(r.operario);
      if (existing) {
        existing.repuestos = toMensual(r);
      } else {
        byOperario.set(r.operario, {
          tecnico: r.tecnico,
          ot: toMensual({
            ...r,
            enero: 0,
            febrero: 0,
            marzo: 0,
            abril: 0,
            mayo: 0,
            junio: 0,
            julio: 0,
            agosto: 0,
            septiembre: 0,
            octubre: 0,
            noviembre: 0,
            diciembre: 0,
          }),
          repuestos: toMensual(r),
          manoObra: null,
        });
      }
    }

    for (const r of moRows) {
      const existing = byOperario.get(r.operario);
      if (existing) {
        existing.manoObra = toMensual(r);
      } else {
        byOperario.set(r.operario, {
          tecnico: r.tecnico,
          ot: toMensual({
            ...r,
            enero: 0,
            febrero: 0,
            marzo: 0,
            abril: 0,
            mayo: 0,
            junio: 0,
            julio: 0,
            agosto: 0,
            septiembre: 0,
            octubre: 0,
            noviembre: 0,
            diciembre: 0,
          }),
          repuestos: null,
          manoObra: toMensual(r),
        });
      }
    }

    const tecnicos: KpiTecnicoDetalladoEntity[] = [];

    for (const [operario, value] of byOperario.entries()) {
      tecnicos.push(
        new KpiTecnicoDetalladoEntity({
          operario,
          tecnico: value.tecnico,
          ot: value.ot,
          repuestos:
            value.repuestos ??
            new KpiTecnicoMensualEntity({
              operario,
              tecnico: value.tecnico,
              enero: 0,
              febrero: 0,
              marzo: 0,
              abril: 0,
              mayo: 0,
              junio: 0,
              julio: 0,
              agosto: 0,
              septiembre: 0,
              octubre: 0,
              noviembre: 0,
              diciembre: 0,
            }),
          manoObra:
            value.manoObra ??
            new KpiTecnicoMensualEntity({
              operario,
              tecnico: value.tecnico,
              enero: 0,
              febrero: 0,
              marzo: 0,
              abril: 0,
              mayo: 0,
              junio: 0,
              julio: 0,
              agosto: 0,
              septiembre: 0,
              octubre: 0,
              noviembre: 0,
              diciembre: 0,
            }),
        }),
      );
    }

    return new KpiResumenEntity({
      mantenimientoPreventivo: mantPrev,
      cargoCliente: cargoCli,
      tecnicos,
    });
  }
}

