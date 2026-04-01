import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInformeMttoPreventivoRepository } from '../../domain/informe-mtto-preventivo.repository';
import { InformeMttoPreventivoEntity, ProximoMtto } from '../../domain/informe-mtto-preventivo.entity';

@Injectable()
export class InformeMttoPreventivoPrismaRepository implements IInformeMttoPreventivoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<InformeMttoPreventivoEntity[]> {
    const sql = Prisma.sql`
      SELECT placa,
             serie,
             kilometro_final,
             km_promedio = (kilometro_final - primer_km) / NULLIF(DATEDIFF(DAY, primer_entrada, fecha_salida), 0),
             ((FLOOR(kilometro_final / 5000) + 1) * 5000) AS next_mtto,
             descripcion
      FROM (
        SELECT
          v.descripcion,
          p.placa,
          p.serie,
          p.primer_entrada,
          p.primer_km,
          fecha_salida = CASE
            WHEN a.fecha IS NULL THEN ao.fecha_ultima_entrada
            ELSE a.fecha
          END,
          kilometro_final = CASE
            WHEN a.kilometraje_salida IS NULL THEN ao.ultimo_km
            ELSE a.kilometraje_salida
          END
        FROM v_primer_km_vh_propio p
        LEFT JOIN v_actual_km_vh_propio a ON p.placa = a.placa
        LEFT JOIN v_actual_km_vh_propio_ordenes ao ON p.placa = ao.placa
        INNER JOIN v_vh_vehiculos v ON p.placa = v.placa
      ) a
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diasRestantesYear = Math.floor((endOfYear.getTime() - now.getTime()) / msPerDay);

    const results: InformeMttoPreventivoEntity[] = [];

    for (const row of rows) {
      const placa: string = row.placa;
      const descripcion: string = row.descripcion;
      const kilometro_final: number = Number(row.kilometro_final ?? 0);
      const km_promedio: number = Number(row.km_promedio ?? 0) || 1; // evitar división por cero
      let next_mtto: number = Number(row.next_mtto ?? 0);

      const proximos: ProximoMtto[] = [];

      let diffKm = next_mtto - kilometro_final;
      let diasNextMtto = diffKm / km_promedio;

      for (let i = 0; i < 10; i++) {
        if (Math.trunc(diasNextMtto) <= diasRestantesYear) {
          const fecha = new Date(now.getTime() + Math.trunc(diasNextMtto) * msPerDay);
          const fechaStr = fecha.toISOString().slice(0, 10);

          proximos.push({
            mttoKm: next_mtto,
            fecha: fechaStr,
          });

          // Nota: en legacy aquí se hace insert condicional en inf_mtto_vh_propios.
          // Por ahora sólo calculamos y devolvemos en memoria para el informe.

          next_mtto += 5000;
          diffKm = next_mtto - kilometro_final;
          diasNextMtto = diffKm / km_promedio;
        } else {
          break;
        }
      }

      let rutina: string | null = null;
      switch (placa) {
        case 'WOM803':
          rutina = 'RUTINA-N400.pdf';
          break;
        case 'XMB415':
          rutina = 'RUTINA-NHR.pdf';
          break;
        case 'SVP019':
          rutina = 'RUTINA-NQR.pdf';
          break;
        case 'TAV656':
          rutina = 'RUTINA-FVR.pdf';
          break;
        case 'TTR469':
          rutina = 'RUTINA-N300.pdf';
          break;
        default:
          rutina = null;
      }

      const diasEntreMtto = Math.trunc(5000 / km_promedio);
      const diasProximoMtto = proximos.length > 0 ? Math.trunc((proximos[0].mttoKm - kilometro_final) / km_promedio) : 0;

      results.push(
        new InformeMttoPreventivoEntity({
          placa,
          descripcion,
          kilometro_final,
          km_promedio,
          dias_entre_mtto: diasEntreMtto,
          dias_proximo_mtto: diasProximoMtto,
          proximos_mtto: proximos,
          rutina,
        }),
      );
    }

    return results;
  }

  async obtenerHistorial(placa: string): Promise<any[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        te.numero AS numero_orden,
        te.bodega,
        fecha_apertura = CONVERT(DATE, te.entrada),
        fecha_factura = CONVERT(DATE, tl.fec),
        tl.tipo,
        tl.numero,
        td.operacion,
        descripcion = CASE
          WHEN r.descripcion IS NULL THEN tt.descripcion
          ELSE r.descripcion
        END,
        td.texto AS explicacion_operacion
      FROM tall_encabeza_orden te
      INNER JOIN tall_detalle_orden td ON te.numero = td.numero
      INNER JOIN v_vh_vehiculos v ON te.serie = v.codigo
      LEFT JOIN tall_documentos_lin tl ON te.numero = tl.numero_orden AND td.operacion = tl.operacion AND td.seq = tl.seq_orden
      LEFT JOIN referencias r ON td.operacion = r.codigo
      LEFT JOIN tall_tempario tt ON td.operacion = tt.operacion
      WHERE v.placa = ${placa}
      ORDER BY numero_orden DESC
    `;

    return rows;
  }
}

