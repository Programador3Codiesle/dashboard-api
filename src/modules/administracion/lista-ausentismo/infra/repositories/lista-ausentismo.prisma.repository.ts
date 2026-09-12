import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IListaAusentismoRepository } from '../../domain/lista-ausentismo.repository';
import { ListaAusentismoEntity } from '../../domain/lista-ausentismo.entity';

@Injectable()
export class ListaAusentismoPrismaRepository implements IListaAusentismoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerDiaActual(sede: string): Promise<ListaAusentismoEntity[]> {
    try {
      const results = await this.prisma.$queryRaw<
        Array<{
          id_ausen: bigint;
          empleado: number | null;
          nombre: string | null;
          fecha: Date | null;
          motivo: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          autorizacion: number | null;
        }>
      >`
        SELECT
          a.id_ausen,
          a.empleado,
          b.nombres AS nombre,
          a.fecha_ini AS fecha,
          a.motivo,
          a.hora_ini AS hora_inicio,
          a.hora_fin,
          a.autorizacion
        FROM postv_ausentismos a
        INNER JOIN terceros b ON a.empleado = b.nit
        INNER JOIN terceros j ON a.nit_usuario_resp = j.nit
        WHERE a.autorizacion <> 2
          AND CONVERT(date, a.fecha_ini) = CONVERT(date, GETDATE())
          AND a.sede = ${sede}
          AND a.confirmaporteria IS NULL
        ORDER BY a.hora_ini ASC
      `;

      return results.map(
        (r) =>
          new ListaAusentismoEntity({
            id: BigInt(r.id_ausen),
            empleado: r.empleado ? Number(r.empleado) : null,
            nombre: r.nombre,
            fecha: r.fecha ? new Date(r.fecha) : null,
            motivo: r.motivo,
            horaInicio: r.hora_inicio ?? null,
            horaFin: r.hora_fin ?? null,
            autorizacion:
              r.autorizacion !== undefined && r.autorizacion !== null
                ? Number(r.autorizacion)
                : null,
          }),
      );
    } catch (error) {
      console.error('Error obteniendo ausentismos del día:', error);
      return [];
    }
  }

  async confirmarPorteria(id: bigint): Promise<boolean> {
    try {
      const affected = await this.prisma.$executeRaw`
        UPDATE postv_ausentismos
        SET confirmaporteria = ${'1'}
        WHERE id_ausen = ${id}
      `;
      return Number(affected) > 0;
    } catch (error) {
      console.error('Error confirmando portería ausentismo:', error);
      return false;
    }
  }
}
