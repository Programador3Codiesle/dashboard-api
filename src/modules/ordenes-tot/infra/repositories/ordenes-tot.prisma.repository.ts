import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  IOrdenesTotRepository,
  PorteriaOrdGralRow,
  PorteriaTotRow,
  PorteriaVehiculoRow,
  RepuestoCandidatoRow,
  TotListadoRow,
  TotReciboRow,
  VehiculoPendienteRow,
} from '../../domain/ordenes-tot.repository';

function toStr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  return '';
}

function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'bigint') return Number(value);
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toStrOrNull(value: unknown): string | null {
  if (value == null) return null;
  const text = toStr(value);
  return text === '' ? null : text;
}

@Injectable()
export class OrdenesTotPrismaRepository implements IOrdenesTotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertVehiculoORepuesto(
    placa: string,
    orden: string,
    idUsuario: number,
    tipo: 'vehiculo' | 'repuesto',
  ): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO postv_vehiculos(placa, fecha_ingreso, orden, autorizacion, usuario, tipo)
        VALUES (${placa}, SYSDATETIME(), ${orden}, 'SI', ${idUsuario}, ${tipo})
      `,
    );
  }

  async insertTot(params: {
    placa: string;
    orden: string;
    idUsuario: number;
    proveedor: string | null;
    contenido: string | null;
  }): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO postv_vehiculos(
          placa, fecha_ingreso, orden, autorizacion, usuario,
          fecha_salida, tipo, proveedor, contenido
        )
        VALUES (
          ${params.placa}, SYSDATETIME(), ${params.orden}, 'SI', ${params.idUsuario},
          SYSDATETIME(), 'tot', ${params.proveedor}, ${params.contenido}
        )
      `,
    );
  }

  async getUltimoIdByOrden(orden: string): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<Array<{ id_vehiculo: unknown }>>(
      Prisma.sql`
        SELECT TOP 1 id_vehiculo
        FROM postv_vehiculos
        WHERE orden = ${orden}
        ORDER BY id_vehiculo DESC
      `,
    );
    if (!rows[0]?.id_vehiculo) return null;
    return toNum(rows[0].id_vehiculo);
  }

  async countOtAbiertas(orden: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: unknown }>>(
      Prisma.sql`
        SELECT COUNT(*) AS n
        FROM tall_encabeza_orden teo
        WHERE teo.facturada = 0
          AND teo.anulada = 0
          AND teo.numero = ${orden}
      `,
    );
    return toNum(rows[0]?.n);
  }

  async getSedesByNit(nit: number): Promise<number[]> {
    if (!nit || !Number.isFinite(nit)) return [];

    const rows = await this.prisma.$queryRaw<Array<{ idsede: unknown }>>(
      Prisma.sql`
        SELECT usede.idsede
        FROM sw_usuariosede usede
        INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
        INNER JOIN terceros t ON t.nit_real = su.nit_usuario
        INNER JOIN bodegas b ON usede.idsede = b.bodega
        WHERE t.nit_real = ${nit}
      `,
    );
    return (rows ?? []).map((r) => toNum(r.idsede)).filter((n) => n > 0);
  }

  async getSedesByIdUsuario(idUsuario: number): Promise<number[]> {
    if (!idUsuario || !Number.isFinite(idUsuario)) return [];

    const rows = await this.prisma.$queryRaw<Array<{ idsede: unknown }>>(
      Prisma.sql`
        SELECT DISTINCT usede.idsede
        FROM sw_usuariosede usede
        INNER JOIN bodegas b ON usede.idsede = b.bodega
        WHERE usede.idusuario = ${idUsuario}
      `,
    );
    return (rows ?? []).map((r) => toNum(r.idsede)).filter((n) => n > 0);
  }

  private totListadoFromWhere(sedes: number[], estado: 1 | 2): Prisma.Sql {
    const reingresoFilter =
      estado === 1 ? Prisma.sql`AND fecha_reingreso is null` : Prisma.empty;
    return Prisma.sql`
      FROM postv_vehiculos pv
      INNER JOIN tall_encabeza_orden teo ON teo.numero = TRY_CAST(pv.orden AS INT)
      INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
      WHERE teo.bodega IN (${Prisma.join(sedes)})
        AND pv.autorizacion = 'SI'
        AND pv.tipo = 'tot'
        ${reingresoFilter}
    `;
  }

  async countTot(sedes: number[], estado: 1 | 2): Promise<number> {
    if (sedes.length === 0) return 0;

    const rows = await this.prisma.$queryRaw<Array<{ n: unknown }>>(
      Prisma.sql`
        SELECT COUNT(*) AS n
        ${this.totListadoFromWhere(sedes, estado)}
      `,
    );
    return toNum(rows[0]?.n);
  }

  async listarTot(
    sedes: number[],
    estado: 1 | 2,
    offset: number,
    limit: number,
  ): Promise<TotListadoRow[]> {
    if (sedes.length === 0) return [];

    const rows = await this.prisma.$queryRaw<
      Array<{
        idsede: unknown;
        orden: unknown;
        placa: unknown;
        descripcion: unknown;
        fecha_ingreso: unknown;
        fecha_salida: unknown;
        fecha_reingreso: unknown;
        proveedor: unknown;
        id_vehiculo: unknown;
        contenido: unknown;
      }>
    >(
      Prisma.sql`
        SELECT teo.bodega AS idsede, pv.orden, vhv.placa, vhv.descripcion,
          CONVERT(CHAR(10), pv.fecha_ingreso, 111) AS fecha_ingreso,
          CONVERT(CHAR(10), pv.fecha_salida, 111) AS fecha_salida,
          CONVERT(CHAR(10), pv.fecha_reingreso, 111) AS fecha_reingreso,
          pv.proveedor, pv.id_vehiculo, pv.contenido
        ${this.totListadoFromWhere(sedes, estado)}
        ORDER BY pv.id_vehiculo DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `,
    );

    return (rows ?? []).map((r) => ({
      idsede: toNum(r.idsede),
      orden: toStr(r.orden),
      placa: toStr(r.placa),
      descripcion: toStr(r.descripcion),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
      fecha_salida: toStrOrNull(r.fecha_salida),
      fecha_reingreso: toStrOrNull(r.fecha_reingreso),
      proveedor: toStrOrNull(r.proveedor),
      id_vehiculo: toNum(r.id_vehiculo),
      contenido: toStrOrNull(r.contenido),
    }));
  }

  async marcarReingreso(idVehiculo: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE postv_vehiculos
        SET fecha_reingreso = SYSDATETIME()
        WHERE id_vehiculo = ${idVehiculo}
      `,
    );
    return Number(result) > 0;
  }

  async infoVehiculoPorteria(): Promise<PorteriaVehiculoRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        nombres: unknown;
        placa: unknown;
        fecha_ingreso: unknown;
        orden: unknown;
        id_vehiculo: unknown;
      }>
    >(
      Prisma.sql`
        SELECT t.nombres, pv.placa,
          CONVERT(VARCHAR, pv.fecha_ingreso, 22) AS fecha_ingreso,
          pv.orden, pv.id_vehiculo
        FROM postv_vehiculos pv
        INNER JOIN w_sist_usuarios u ON pv.usuario = u.id_usuario
        INNER JOIN terceros t ON t.nit = u.nit_usuario
        WHERE pv.autorizacion = 'SI'
          AND pv.tipo = 'vehiculo'
          AND pv.fecha_salida is NULL
          AND u.perfil_postventa IN ('1', '2', '8', '9')
        ORDER BY fecha_ingreso DESC
      `,
    );

    return (rows ?? []).map((r) => ({
      nombres: toStr(r.nombres),
      placa: toStr(r.placa),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
      orden: toStr(r.orden),
      id_vehiculo: toNum(r.id_vehiculo),
    }));
  }

  async infoTotPorteria(sedes: number[]): Promise<PorteriaTotRow[]> {
    if (sedes.length === 0) return [];

    const rows = await this.prisma.$queryRaw<
      Array<{
        nombres: unknown;
        placa: unknown;
        fecha_ingreso: unknown;
        orden: unknown;
        proveedor: unknown;
        contenido: unknown;
        fecha_salida: unknown;
        id_vehiculo: unknown;
      }>
    >(
      Prisma.sql`
        SELECT
          t.nombres,
          vhv.placa,
          CONVERT(VARCHAR, pv.fecha_ingreso, 22) AS fecha_ingreso,
          pv.orden,
          pv.proveedor,
          pv.contenido,
          CONVERT(VARCHAR, pv.fecha_salida, 22) AS fecha_salida,
          pv.id_vehiculo
        FROM postv_vehiculos pv
        INNER JOIN w_sist_usuarios u ON pv.usuario = u.id_usuario
        INNER JOIN terceros t ON t.nit = u.nit_usuario
        INNER JOIN tall_encabeza_orden teo ON teo.numero = TRY_CAST(pv.orden AS INT)
        INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
        WHERE pv.autorizacion = 'SI'
          AND teo.bodega IN (${Prisma.join(sedes)})
          AND pv.tipo = 'tot'
          AND pv.fecha_reingreso IS NULL
        ORDER BY pv.fecha_ingreso DESC
      `,
    );

    return (rows ?? []).map((r) => ({
      nombres: toStr(r.nombres),
      placa: toStr(r.placa),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
      orden: toStr(r.orden),
      proveedor: toStrOrNull(r.proveedor),
      contenido: toStrOrNull(r.contenido),
      fecha_salida: toStrOrNull(r.fecha_salida),
      id_vehiculo: toNum(r.id_vehiculo),
    }));
  }

  async infoOrdGralPorteria(): Promise<PorteriaOrdGralRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        nombres: unknown;
        placa: unknown;
        fecha_ingreso: unknown;
        contenido: unknown;
        id_vehiculo: unknown;
      }>
    >(
      Prisma.sql`
        SELECT t.nombres, pv.placa,
          CONVERT(VARCHAR, pv.fecha_ingreso, 22) AS fecha_ingreso,
          pv.contenido, pv.id_vehiculo
        FROM postv_vehiculos pv
        INNER JOIN w_sist_usuarios u ON pv.usuario = u.id_usuario
        INNER JOIN terceros t ON t.nit = u.nit_usuario
        WHERE pv.autorizacion = 'SI'
          AND pv.tipo = 'Orden General'
          AND pv.fecha_salida is NULL
          AND u.perfil_postventa IN ('1', '2', '8', '9')
        ORDER BY fecha_ingreso DESC
      `,
    );

    return (rows ?? []).map((r) => ({
      nombres: toStr(r.nombres),
      placa: toStr(r.placa),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
      contenido: toStrOrNull(r.contenido),
      id_vehiculo: toNum(r.id_vehiculo),
    }));
  }

  async confirmarSalida(idVehiculo: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE postv_vehiculos
        SET fecha_salida = SYSDATETIME(), autorizacion = 'SI'
        WHERE id_vehiculo = ${idVehiculo}
      `,
    );
    return Number(result) > 0;
  }

  async infoTotRecibo(idVehiculo: number): Promise<TotReciboRow | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        nombres: unknown;
        placa: unknown;
        descripcion: unknown;
        fecha_ingreso: unknown;
        orden: unknown;
        proveedor: unknown;
        contenido: unknown;
        fecha_salida: unknown;
        id_vehiculo: unknown;
        aseguradora: unknown;
      }>
    >(
      Prisma.sql`
        SELECT TOP 1
          t.nombres,
          vhv.placa,
          vhv.descripcion,
          CONVERT(VARCHAR, pv.fecha_ingreso, 22) AS fecha_ingreso,
          pv.orden,
          pv.proveedor,
          pv.contenido,
          CONVERT(VARCHAR, pv.fecha_salida, 22) AS fecha_salida,
          pv.id_vehiculo,
          ase.nombres AS aseguradora
        FROM postv_vehiculos pv
        INNER JOIN w_sist_usuarios u ON pv.usuario = u.id_usuario
        INNER JOIN terceros t ON t.nit = u.nit_usuario
        INNER JOIN tall_encabeza_orden teo ON teo.numero = pv.orden
        INNER JOIN terceros ase ON ase.nit = teo.aseguradora
        INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
        WHERE pv.autorizacion = 'SI'
          AND pv.tipo = 'tot'
          AND pv.id_vehiculo = ${idVehiculo}
        ORDER BY fecha_ingreso DESC
      `,
    );

    const r = rows[0];
    if (!r) return null;

    return {
      nombres: toStr(r.nombres),
      placa: toStr(r.placa),
      descripcion: toStr(r.descripcion),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
      orden: toStr(r.orden),
      proveedor: toStrOrNull(r.proveedor),
      contenido: toStrOrNull(r.contenido),
      fecha_salida: toStrOrNull(r.fecha_salida),
      id_vehiculo: toNum(r.id_vehiculo),
      aseguradora: toStrOrNull(r.aseguradora),
    };
  }

  async listarVehiculosPendientes(
    sedes: number[],
  ): Promise<VehiculoPendienteRow[]> {
    if (sedes.length === 0) return [];

    const rows = await this.prisma.$queryRaw<
      Array<{
        id_vehiculo: unknown;
        orden: unknown;
        placa: unknown;
        autorizacion: unknown;
        fecha_ingreso: unknown;
        fecha_salida: unknown;
        fecha_reingreso: unknown;
      }>
    >(
      Prisma.sql`
        SELECT pv.id_vehiculo, pv.orden, pv.placa, pv.autorizacion,
          CONVERT(CHAR(10), pv.fecha_ingreso, 111) AS fecha_ingreso,
          CONVERT(CHAR(10), pv.fecha_salida, 111) AS fecha_salida,
          CONVERT(CHAR(10), pv.fecha_reingreso, 111) AS fecha_reingreso
        FROM postv_vehiculos pv
        INNER JOIN tall_encabeza_orden teo ON teo.numero = TRY_CAST(pv.orden AS INT)
        WHERE teo.bodega IN (${Prisma.join(sedes)})
          AND pv.autorizacion = 'SI'
          AND pv.tipo = 'vehiculo'
          AND pv.fecha_salida IS NULL
        ORDER BY pv.fecha_ingreso DESC
      `,
    );

    return (rows ?? []).map((r) => ({
      id_vehiculo: toNum(r.id_vehiculo),
      orden: toStr(r.orden),
      placa: toStr(r.placa),
      autorizacion: toStr(r.autorizacion),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
      fecha_salida: toStrOrNull(r.fecha_salida),
      fecha_reingreso: toStrOrNull(r.fecha_reingreso),
    }));
  }

  async listarRepuestosCandidatos(): Promise<RepuestoCandidatoRow[]> {
    // TOP 200 + fec >= 20200401: tope del legado. OFFSET no abarata el GROUP BY.
    const rows = await this.prisma.$queryRaw<
      Array<{
        numero: unknown;
        placa: unknown;
        descripcion: unknown;
        fecha_ingreso: unknown;
      }>
    >(
      Prisma.sql`
        SELECT TOP 200
          a.numero,
          MAX(b.placa) AS placa,
          MAX(bo.descripcion) AS descripcion,
          CAST(NULL AS datetime) AS fecha_ingreso
        FROM tall_documentos_lin a
        INNER JOIN v_vh_vehiculos b ON a.serie = b.codigo
        INNER JOIN referencias c ON c.codigo = a.operacion
        INNER JOIN bodegas bo ON bo.bodega = a.bodega
        WHERE a.fec >= '20200401'
          AND NOT EXISTS (
            SELECT 1
            FROM postv_vehiculos pv
            WHERE pv.orden = CONVERT(VARCHAR(30), a.numero)
          )
        GROUP BY a.numero
        ORDER BY a.numero DESC
      `,
    );

    return (rows ?? []).map((r) => ({
      numero: toStr(r.numero),
      placa: toStr(r.placa),
      descripcion: toStr(r.descripcion),
      fecha_ingreso: toStrOrNull(r.fecha_ingreso),
    }));
  }
}
