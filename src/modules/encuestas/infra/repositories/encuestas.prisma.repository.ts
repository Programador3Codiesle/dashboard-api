import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import type {
  ContactoPlaca,
  EncuestaGmRow,
  EncuestasRepository,
  NpsSedeInput,
  NpsTecnicoInput,
  PreguntaEncuesta,
  SatisfaccionDetalleOrden,
  SatisfaccionListItem,
  SatisfaccionRespuestas,
  TecnicoNps,
  VehiculoEncuestaQr,
} from '../../domain/encuestas.repository';

function asStr(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function asStrOrNull(v: unknown): string | null {
  if (v == null || v === '') return null;
  return String(v);
}

@Injectable()
export class EncuestasPrismaRepository implements EncuestasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarSatisfaccion(): Promise<SatisfaccionListItem[]> {
    // pes.fecha puede venir como varchar con formatos mixtos o basura;
    // mismo patrón seguro del informe filtrado (TRY_CONVERT 23/103).
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        nit_real,
        nombres,
        numero,
        placa,
        fecha
      FROM (
        SELECT DISTINCT
          cli.nit_real,
          cli.nombres,
          teo.numero,
          vhv.placa,
          COALESCE(
            TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
            TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
            TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
          ) AS fecha
        FROM terceros cli
        INNER JOIN tall_encabeza_orden teo ON teo.nit = cli.nit_real
        INNER JOIN v_vh_vehiculos vhv ON teo.serie = vhv.codigo
        INNER JOIN posv_encuesta_satisfaccion pes ON pes.n_orden = teo.numero
      ) t
      ORDER BY fecha DESC
    `);

    return rows.map((r) => ({
      nit_real: asStr(r.nit_real),
      nombres: asStr(r.nombres),
      numero: asStr(r.numero),
      placa: asStr(r.placa),
      fecha: asStr(r.fecha),
    }));
  }

  async detalleOrdenSatisfaccion(
    ot: string,
  ): Promise<SatisfaccionDetalleOrden | null> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT DISTINCT
        client.nombres AS cliente,
        client.nit_real AS nit_client,
        tec.nombres AS tecnico,
        b.descripcion,
        teo.numero
      FROM tall_encabeza_orden teo
      INNER JOIN terceros client ON client.nit_real = teo.nit
      INNER JOIN terceros tec ON tec.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.id = teo.bodega
      WHERE teo.numero = ${ot}
    `);
    const r = rows[0];
    if (!r) return null;
    return {
      cliente: asStr(r.cliente),
      nit_client: asStr(r.nit_client),
      tecnico: asStr(r.tecnico),
      descripcion: asStr(r.descripcion),
      numero: asStr(r.numero),
    };
  }

  async respuestasSatisfaccion(
    ot: string,
  ): Promise<SatisfaccionRespuestas | null> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT pregunta1, pregunta2, pregunta3, pregunta4, pregunta5
      FROM posv_encuesta_satisfaccion
      WHERE n_orden = ${ot}
    `);
    const r = rows[0];
    if (!r) return null;
    return {
      pregunta1: r.pregunta1 as string | number | null,
      pregunta2: r.pregunta2 as string | number | null,
      pregunta3: r.pregunta3 as string | number | null,
      pregunta4: r.pregunta4 as string | number | null,
      pregunta5: r.pregunta5 as string | number | null,
    };
  }

  async listarTecnicosNps(): Promise<TecnicoNps[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        patio = (
          CASE
            WHEN patio IN (1, 13, 12) THEN 'GASOLINA GIRON'
            WHEN patio = 3 THEN 'DIESEL GIRON'
            WHEN patio = 11 THEN 'ELECTRICISTAS'
            WHEN patio = 5 THEN 'GASOLINA BARRANCA'
            WHEN patio = 6 THEN 'DIESEL BARRANCA'
            WHEN patio = 4 THEN 'GASOLINA ROSITA'
            WHEN patio = 7 THEN 'GASOLINA BOCONO'
            WHEN patio = 12 THEN 'ALINEADORES'
            WHEN patio = 8 THEN 'DIESEL BOCONO'
          END
        ),
        nit,
        nombre,
        presupuesto,
        Comision,
        bodega,
        patio AS patio_id
      FROM tall_operarios_intranet
    `);
    return rows.map((r) => ({
      nit: asStr(r.nit),
      nombre: asStr(r.nombre),
      patio: asStrOrNull(r.patio),
    }));
  }

  async contarNpsSede(fecha: string, sede: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>(Prisma.sql`
      SELECT COUNT(*) AS n
      FROM NPS_sedes
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, ${fecha})
        AND sede = ${sede}
    `);
    return Number(rows[0]?.n ?? 0);
  }

  async insertNpsSede(data: NpsSedeInput): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO NPS_SEDES(sede, Fecha, Calificacion, Enc_0_a_6, Enc_7_a_8, Enc_9_a_10)
        VALUES (
          ${data.sede},
          ${data.fecha},
          ${data.calificacion},
          ${data.cal06},
          ${data.cal78},
          ${data.cal910}
        )
      `);
      return true;
    } catch {
      return false;
    }
  }

  async updateNpsSede(data: NpsSedeInput): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE NPS_sedes
        SET
          Calificacion = ${data.calificacion},
          Enc_0_a_6 = ${data.cal06},
          Enc_7_a_8 = ${data.cal78},
          Enc_9_a_10 = ${data.cal910}
        WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, ${data.fecha})
          AND sede = ${data.sede}
      `);
      return true;
    } catch {
      return false;
    }
  }

  async contarNpsTecnico(fecha: string, tecnico: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>(Prisma.sql`
      SELECT COUNT(*) AS n
      FROM NPS_tecnicos
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, ${fecha})
        AND tecnico = ${tecnico}
    `);
    return Number(rows[0]?.n ?? 0);
  }

  async insertNpsTecnico(data: NpsTecnicoInput): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO NPS_tecnicos(
          Sede, fecha, tecnico, Placa, Calificacion,
          Enc_0_a_6, Enc_7_a_8, Enc_9_a_10, Tipificacion
        )
        VALUES (
          ${data.sede},
          ${data.fecha},
          ${data.tecnico},
          ${data.placa},
          ${data.calificacion},
          ${data.encu06},
          ${data.encu78},
          ${data.encu910},
          ${data.tipificacion}
        )
      `);
      return true;
    } catch {
      return false;
    }
  }

  async updateNpsTecnico(data: NpsTecnicoInput): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE NPS_tecnicos
        SET
          Calificacion = ${data.calificacion},
          Placa = ${data.placa},
          Enc_0_a_6 = ${data.encu06},
          Enc_7_a_8 = ${data.encu78},
          Enc_9_a_10 = ${data.encu910},
          Tipificacion = ${data.tipificacion},
          Sede = ${data.sede}
        WHERE CONVERT(DATE, fecha) = CONVERT(DATE, ${data.fecha})
          AND tecnico = ${data.tecnico}
      `);
      return true;
    } catch {
      return false;
    }
  }

  async contarEncuestaGm(idEncuesta: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>(Prisma.sql`
      SELECT COUNT(*) AS n
      FROM postv_encuestas_gm
      WHERE id_encuesta = ${idEncuesta}
    `);
    return Number(rows[0]?.n ?? 0);
  }

  async insertEncuestaGm(row: EncuestaGmRow): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO postv_encuestas_gm (
          id_encuesta, sede, nom_cliente, nom_tecnico, nit_tecnico, VIN,
          fecha_evento, fecha_recibido_enc, tipo_evento, modelo_vh,
          recomendacion_concesionario, satisfaccion_concesionario,
          satisfaccion_trabajo, vh_reparado_ok, recomendacion_marca,
          comentarios, fuente
        )
        VALUES (
          ${row.id_encuesta},
          ${row.sede},
          ${row.nom_cliente},
          ${row.nom_tecnico},
          ${row.nit_tecnico},
          ${row.VIN},
          ${row.fecha_evento},
          ${row.fecha_recibido_enc},
          ${row.tipo_evento},
          ${row.modelo_vh},
          ${row.recomendacion_concesionario},
          ${row.satisfaccion_concesionario},
          ${row.satisfaccion_trabajo},
          ${row.vh_reparado_ok},
          ${row.recomendacion_marca},
          ${row.comentarios},
          'GM'
        )
      `);
      return true;
    } catch {
      return false;
    }
  }

  async insertNpsTec(row: {
    nit_tecnico: string;
    nom_cliente: string;
    fecha_recibido_enc: string;
    recomendacion_concesionario: string | number;
    sede: string;
  }): Promise<boolean> {
    try {
      const nit = Number(row.nit_tecnico) || 0;
      const cal = Number(row.recomendacion_concesionario) || 0;
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO nps_tec (nit_tec, nombres, fecha_enc, calificacion, sede)
        VALUES (
          ${nit},
          ${row.nom_cliente},
          ${row.fecha_recibido_enc},
          ${cal},
          ${row.sede}
        )
      `);
      return true;
    } catch {
      return false;
    }
  }

  async listarPreguntasEncuesta(): Promise<PreguntaEncuesta[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT id, pregunta, tipo
      FROM posv_preguntas_encuesta_satisfaccion
    `);
    return rows.map((r) => ({
      id: Number(r.id),
      pregunta: asStr(r.pregunta),
      tipo: asStr(r.tipo),
    }));
  }

  async buscarEncuestaByPlaca(placa: string): Promise<VehiculoEncuestaQr | null> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT TOP 1
        v.nit_comprador,
        t.nombres,
        t.mail,
        t.celular,
        e.*,
        o.*,
        v.des_marca,
        v.descripcion AS desc_modelo,
        v.des_color,
        e.numero AS n_ord
      FROM v_base__postv_encuesta_nps e
      LEFT JOIN postv_taller_jefe_ord_salida o ON o.numero = e.numero
      LEFT JOIN v_vh_vehiculos v ON v.placa = e.placa
      LEFT JOIN terceros t ON t.nit = v.nit_comprador
      WHERE e.placa = ${placa}
        AND o.encuesta IS NULL
      ORDER BY o.fecha_solicitud DESC
    `);
    const r = rows[0];
    if (!r) return null;
    return {
      numero: asStr(r.n_ord ?? r.numero),
      bodega: (r.bodega as string | number | null) ?? null,
      placa: asStr(r.placa),
      marca: asStrOrNull(r.des_marca),
      des_modelo: asStrOrNull(r.desc_modelo),
      color: asStrOrNull(r.des_color),
      nit_comprador: asStrOrNull(r.nit_comprador),
      nombres: asStrOrNull(r.nombres),
      mail: asStrOrNull(r.mail),
      celular: asStrOrNull(r.celular),
    };
  }

  async buscarContactoByNit(
    nit: string,
    placa: string,
  ): Promise<ContactoPlaca | null> {
    const nitNum = Number(nit);
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT nit, nombres, telefono, mail
      FROM postv_contactos_placas
      WHERE nit = ${nitNum}
        AND placa = ${placa}
    `);
    const r = rows[0];
    if (!r) return null;
    return {
      nit: asStr(r.nit),
      nombres: asStrOrNull(r.nombres),
      telefono: asStrOrNull(r.telefono),
      mail: asStrOrNull(r.mail),
    };
  }

  async insertContactoPlaca(data: {
    placa: string;
    nit: string;
    nombres: string;
    telefono: string;
    mail: string;
    fecha_registro: string;
  }): Promise<boolean> {
    try {
      const nitNum = Number(data.nit);
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO postv_contactos_placas (placa, nit, nombres, telefono, mail, fecha_registro)
        VALUES (
          ${data.placa},
          ${nitNum},
          ${data.nombres},
          ${data.telefono},
          ${data.mail},
          ${data.fecha_registro}
        )
      `);
      return true;
    } catch {
      return false;
    }
  }

  async updateContactoPlaca(
    where: { nit: string; placa: string },
    data: {
      nombres?: string;
      telefono?: string;
      mail?: string;
      contactar?: number;
      fecha_actualizacion?: string;
    },
  ): Promise<boolean> {
    try {
      const nitNum = Number(where.nit);
      if (data.nombres != null) {
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE postv_contactos_placas
          SET
            nombres = ${data.nombres},
            telefono = ${data.telefono ?? ''},
            mail = ${data.mail ?? ''},
            fecha_actualizacion = ${data.fecha_actualizacion ?? null}
          WHERE nit = ${nitNum} AND placa = ${where.placa}
        `);
      } else if (data.contactar != null) {
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE postv_contactos_placas
          SET
            contactar = ${data.contactar},
            fecha_actualizacion = ${data.fecha_actualizacion ?? null}
          WHERE nit = ${nitNum} AND placa = ${where.placa}
        `);
      }
      return true;
    } catch {
      return false;
    }
  }

  async updateTercero(
    nit: string,
    data: { mail?: string; celular?: string; concepto_7?: number },
  ): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(
        Prisma.sql`ALTER TABLE terceros DISABLE TRIGGER ALL`,
      );
      if (data.concepto_7 != null) {
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE terceros
          SET concepto_7 = ${data.concepto_7}
          WHERE nit = ${nit}
        `);
      } else {
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE terceros
          SET mail = ${data.mail ?? ''}, celular = ${data.celular ?? ''}
          WHERE nit = ${nit}
        `);
      }
      await this.prisma.$executeRaw(
        Prisma.sql`ALTER TABLE terceros ENABLE TRIGGER ALL`,
      );
      return true;
    } catch {
      try {
        await this.prisma.$executeRaw(
          Prisma.sql`ALTER TABLE terceros ENABLE TRIGGER ALL`,
        );
      } catch {
        /* ignore */
      }
      return false;
    }
  }

  async insertEncuestaSatisfaccionQr(data: {
    placa: string;
    fecha: string;
    pregunta1: string | number;
    pregunta2: string | number;
    pregunta3: string | number | null;
    pregunta4: string | number | null;
    pregunta5: string | null;
    fuente: string;
    bod: string | number;
    numero_orden: string | number;
  }): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO postv_encuesta_satisfaccion_qr (
          placa, fecha, pregunta1, pregunta2, pregunta3, pregunta4, pregunta5,
          fuente, bod, numero_orden
        )
        VALUES (
          ${data.placa},
          ${data.fecha},
          ${String(data.pregunta1)},
          ${String(data.pregunta2)},
          ${data.pregunta3 == null ? null : String(data.pregunta3)},
          ${data.pregunta4 == null ? null : String(data.pregunta4)},
          ${data.pregunta5},
          ${data.fuente},
          ${String(data.bod)},
          ${String(data.numero_orden)}
        )
      `);
      return true;
    } catch {
      return false;
    }
  }

  async selectOrdenSalida(numero: string | number): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>(Prisma.sql`
      SELECT COUNT(*) AS n
      FROM postv_taller_jefe_ord_salida
      WHERE numero = ${String(numero)}
    `);
    return Number(rows[0]?.n ?? 0) > 0;
  }

  async updateOrdenSalida(
    numero: string | number,
    data: {
      encuesta: number;
      propietario: string | number;
      fecha_encuesta: string;
      usuario_vh: string | number;
    },
  ): Promise<number> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_taller_jefe_ord_salida
      SET
        encuesta = ${data.encuesta},
        propietario = ${String(data.propietario)},
        fecha_encuesta = ${data.fecha_encuesta},
        usuario_vh = ${String(data.usuario_vh)}
      WHERE numero = ${String(numero)}
    `);
    return Number(result);
  }

  async insertOrdenSalida(data: {
    numero: string | number;
    placa_vh?: string;
    bodega_o?: string | number;
    encuesta: number;
    propietario: string | number;
    fecha_encuesta: string;
    usuario_vh: string | number;
  }): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO postv_taller_jefe_ord_salida (
          numero, placa_vh, bodega_o, encuesta, propietario, fecha_encuesta, usuario_vh
        )
        VALUES (
          ${String(data.numero)},
          ${data.placa_vh ?? null},
          ${data.bodega_o == null ? null : String(data.bodega_o)},
          ${data.encuesta},
          ${String(data.propietario)},
          ${data.fecha_encuesta},
          ${String(data.usuario_vh)}
        )
      `);
      return true;
    } catch {
      return false;
    }
  }
}
