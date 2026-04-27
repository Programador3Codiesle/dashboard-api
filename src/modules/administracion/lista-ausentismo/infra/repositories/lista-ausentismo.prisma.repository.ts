import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IListaAusentismoRepository } from '../../domain/lista-ausentismo.repository';
import { ListaAusentismoEntity } from '../../domain/lista-ausentismo.entity';

@Injectable()
export class ListaAusentismoPrismaRepository implements IListaAusentismoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerDiaActual(): Promise<ListaAusentismoEntity[]> {
    try {
      const hoy = new Date();
      const fecha = hoy.toISOString().split('T')[0];

      // Optimizado: Usar $queryRaw con parámetro seguro
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    a.id_ausen, a.empleado, a.fecha_ini AS fecha, a.motivo,
                    a.hora_ini AS hora_inicio,
                    a.hora_fin AS hora_fin,
                    a.autorizacion,
                    t.nombres AS nombre
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                WHERE CAST(a.fecha_ini AS DATE) = ${fecha}
                AND a.motivo != 'Tiempo Suplementario'
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
}
