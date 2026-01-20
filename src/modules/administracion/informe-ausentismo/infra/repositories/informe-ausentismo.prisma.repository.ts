import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IAusentismoRepository } from '../../domain/ausentismo.repository';
import { AusentismoEntity } from '../../domain/ausentismo.entity';

@Injectable()
export class InformeAusentismoPrismaRepository implements IAusentismoRepository {
    constructor(private readonly prisma: PrismaService) {}

    async listar(filtros?: any): Promise<AusentismoEntity[]> {
        try {
            let sql = `
                SELECT 
                    a.id_ausen, a.sede, a.area, a.fecha_ini AS fecha_inicio,
                    a.hora_ini AS hora_inicio, a.fecha_fin AS fecha_fin, 
                    a.hora_fin, a.autorizacion AS estado, a.descripcion AS detalle,
                    t.nombres AS colaborador,
                    j.nombres AS gestionado_por
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                LEFT JOIN terceros j ON j.nit_real = a.nit_usuario_resp
                WHERE 1=1
            `;

            if (filtros?.fecha_desde) {
                sql += ` AND CAST(a.fecha_ini AS DATE) >= '${filtros.fecha_desde}'`;
            }
            if (filtros?.fecha_hasta) {
                sql += ` AND CAST(a.fecha_ini AS DATE) <= '${filtros.fecha_hasta}'`;
            }
            if (filtros?.sede) {
                sql += ` AND a.sede LIKE '%${filtros.sede}%'`;
            }

            sql += ` ORDER BY a.fecha_ini DESC`;

            const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
            return results.map(r => new AusentismoEntity({
                id_ausen: BigInt(r.id_ausen),
                gestionado_por: r.gestionado_por,
                colaborador: r.colaborador,
                sede: r.sede,
                area: r.area,
                fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
                hora_inicio: r.hora_inicio,
                fecha_fin: r.fecha_fin ? new Date(r.fecha_fin) : null,
                hora_fin: r.hora_fin,
                estado: r.estado ? Number(r.estado) : null,
                detalle: r.detalle
            }));
        } catch (error) {
            console.error('Error listando ausentismos:', error);
            return [];
        }
    }

    async findById(id: bigint): Promise<AusentismoEntity | null> {
        try {
            const sql = `
                SELECT 
                    a.id_ausen, a.sede, a.area, a.fecha_ini AS fecha_inicio,
                    a.hora_ini AS hora_inicio, a.fecha_fin AS fecha_fin, 
                    a.hora_fin, a.autorizacion AS estado, a.descripcion AS detalle,
                    t.nombres AS colaborador,
                    j.nombres AS gestionado_por
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                LEFT JOIN terceros j ON j.nit_real = a.nit_usuario_resp
                WHERE a.id_ausen = ${id}
            `;

            const result = await this.prisma.$queryRawUnsafe<any[]>(sql);
            if (!result || result.length === 0) return null;

            const r = result[0];
            return new AusentismoEntity({
                id_ausen: BigInt(r.id_ausen),
                gestionado_por: r.gestionado_por,
                colaborador: r.colaborador,
                sede: r.sede,
                area: r.area,
                fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
                hora_inicio: r.hora_inicio,
                fecha_fin: r.fecha_fin ? new Date(r.fecha_fin) : null,
                hora_fin: r.hora_fin,
                estado: r.estado ? Number(r.estado) : null,
                detalle: r.detalle
            });
        } catch (error) {
            console.error('Error obteniendo detalle:', error);
            return null;
        }
    }
}
