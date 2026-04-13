import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosInformeEntradaVh,
  IInformeEntradaVhRepository,
} from '../../domain/entrada-vh.repository';
import { InformeEntradaVhResumenEntity } from '../../domain/entrada-vh.entity';

@Injectable()
export class InformeEntradaVhPrismaRepository implements IInformeEntradaVhRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(
    filtros: FiltrosInformeEntradaVh,
  ): Promise<InformeEntradaVhResumenEntity> {
    const { year, month } = filtros;

    const [citasAsistidasRow] = await this.prisma.$queryRaw<
      { citas_asistidas: number }[]
    >(Prisma.sql`
      SELECT COUNT(*) AS citas_asistidas
      FROM tall_citas tc 
      INNER JOIN postv_entrada_vh_taller et ON et.id_cita = tc.id_cita
      WHERE MONTH(CONVERT(DATE,fecha_hora_ini)) = ${month}
        AND YEAR(CONVERT(DATE,fecha_hora_ini)) = ${year}
        AND estado_cita = 'A'
        AND tc.bodega IN (1,11,9,21)
    `);

    const [citasAgendadasRow] = await this.prisma.$queryRaw<
      { citas_agendadas: number }[]
    >(Prisma.sql`
      SELECT COUNT(*) AS citas_agendadas
      FROM tall_citas tc 
      WHERE MONTH(CONVERT(DATE,fecha_hora_ini)) = ${month}
        AND YEAR(CONVERT(DATE,fecha_hora_ini)) = ${year}
        AND estado_cita = 'A'
        AND tc.bodega IN (1,11,9,21)
    `);

    const citasAsistidas = Number(citasAsistidasRow?.citas_asistidas ?? 0);
    const citasAgendadas = Number(citasAgendadasRow?.citas_agendadas ?? 0);

    const porcentajeCitasCumplidas =
      (citasAsistidas / (citasAgendadas !== 0 ? citasAgendadas : 1)) * 100;

    const estados = await this.prisma.$queryRaw<
      { Estado_cita: string }[]
    >(Prisma.sql`
      SELECT Estado_cita = CASE
        WHEN DATEDIFF(minute,tc.fecha_hora_ini,et.fecha_hora) BETWEEN -5 AND 5 THEN 'A_tiempo' 
        WHEN DATEDIFF(minute,tc.fecha_hora_ini,et.fecha_hora) > 5 THEN 'Llegó tarde' 
        WHEN DATEDIFF(minute,tc.fecha_hora_ini,et.fecha_hora) < -5 THEN 'Llegó Antes de Tiempo'
        ELSE 'No registra'
      END
      FROM tall_citas tc 
      INNER JOIN postv_entrada_vh_taller et ON et.id_cita = tc.id_cita
      WHERE MONTH(CONVERT(DATE,fecha_hora_ini)) = ${month}
        AND YEAR(CONVERT(DATE,fecha_hora_ini)) = ${year}
        AND estado_cita = 'A'
        AND tc.bodega IN (1,11,9,21)
    `);

    let cantidadTemprano = 0;
    let cantidadAtiempo = 0;
    let cantidadTarde = 0;

    for (const row of estados) {
      if (row.Estado_cita === 'A_tiempo') {
        cantidadAtiempo++;
      } else if (row.Estado_cita === 'Llegó tarde') {
        cantidadTarde++;
      } else if (row.Estado_cita === 'Llegó Antes de Tiempo') {
        cantidadTemprano++;
      }
    }

    let porcentajeTemprano = 0;
    let porcentajeAtiempo = 0;
    let porcentajeTarde = 0;

    if (citasAsistidas !== 0) {
      porcentajeAtiempo = (cantidadAtiempo / citasAsistidas) * 100;
      porcentajeTemprano = (cantidadTemprano / citasAsistidas) * 100;
      porcentajeTarde = (cantidadTarde / citasAsistidas) * 100;
    }

    const [vhSinCitaRow] = await this.prisma.$queryRaw<
      { n_vh_sin_cita: number }[]
    >(Prisma.sql`
      SELECT COUNT(*) AS n_vh_sin_cita
      FROM postv_vh_sin_cita vhs 
      WHERE MONTH(CONVERT(DATE,vhs.fecha)) = ${month}
        AND YEAR(CONVERT(DATE,vhs.fecha)) = ${year}
        AND vhs.bodegas IN (1,11,9,21)
    `);

    const vhSinCita = Number(vhSinCitaRow?.n_vh_sin_cita ?? 0);
    const totalIngresos = vhSinCita + citasAsistidas;

    const porcentajeVhAgendados =
      (citasAgendadas / (totalIngresos !== 0 ? totalIngresos : 1)) * 100;

    return new InformeEntradaVhResumenEntity({
      anio: year,
      mes: month,
      citasAgendadas,
      citasAsistidas,
      porcentajeCitasCumplidas,
      cantidadTemprano,
      cantidadAtiempo,
      cantidadTarde,
      porcentajeTemprano,
      porcentajeAtiempo,
      porcentajeTarde,
      vhSinCita,
      totalIngresos,
      porcentajeVhAgendados,
    });
  }
}
