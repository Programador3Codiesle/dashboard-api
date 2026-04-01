import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosEncuestasInternas,
  IEncuestasInternasRepository,
} from '../../domain/encuestas-internas.repository';
import { EncuestaInternaRowEntity } from '../../domain/encuestas-internas.entity';

@Injectable()
export class EncuestasInternasPrismaRepository
  implements IEncuestasInternasRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async obtener(
    filtros: FiltrosEncuestasInternas,
  ): Promise<EncuestaInternaRowEntity[]> {
    const { fechaInicio, fechaFin } = filtros;

    const rows = await this.prisma.$queryRaw<
      {
        numero_orden: number;
        fecha_ot: Date;
        hora_ot: string;
        placa: string;
        nit: string;
        nombres: string;
        descripcion: string;
        celular: string | null;
        telefono_1: string | null;
        telefono_2: string | null;
        mail: string | null;
        fecha_enc: Date;
        pregunta1: string;
      }[]
    >(Prisma.sql`
      SELECT
        qr.numero_orden,
        CONVERT(VARCHAR, ot.fecha, 23) AS fecha_ot,
        CONVERT(VARCHAR, ot.fecha, 8) AS hora_ot,
        qr.placa,
        ot.nit,
        t.nombres,
        b.descripcion,
        t.celular,
        t.telefono_1,
        t.telefono_2,
        t.mail,
        qr.fecha AS fecha_enc,
        qr.pregunta1
      FROM postv_encuesta_satisfaccion_qr qr
      INNER JOIN tall_encabeza_orden ot ON qr.numero_orden = ot.numero
      INNER JOIN terceros t ON ot.nit = t.nit
      INNER JOIN bodegas b ON qr.bod = b.bodega
      WHERE qr.numero_orden IS NOT NULL
        AND qr.fecha >= ${fechaInicio}
        AND qr.fecha <= ${fechaFin}
      ORDER BY qr.id DESC
    `);

    return rows.map(
      (r) =>
        new EncuestaInternaRowEntity({
          numeroOrden: Number(r.numero_orden),
          bodega: r.descripcion,
          fechaOt: r.fecha_ot instanceof Date ? r.fecha_ot.toISOString() : String(r.fecha_ot),
          horaOt: r.hora_ot,
          placa: r.placa,
          nit: r.nit,
          cliente: r.nombres,
          celular: r.celular,
          telefono1: r.telefono_1,
          telefono2: r.telefono_2,
          correo: r.mail,
          fechaEncuesta: r.fecha_enc.toISOString(),
          calificacion: r.pregunta1,
        }),
    );
  }
}

