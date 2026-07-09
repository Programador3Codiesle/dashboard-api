import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IEntradaVehiculoRepository } from '../../domain/entrada-vehiculo.repository';
import {
  CitaEntradaEntity,
  SedeUsuarioEntity,
  VhSinCitaEntity,
  VhSinOtEntity,
} from '../../domain/entrada-vehiculo.entity';
import { toNum, toStr } from './shared.utils';

type CitaRow = {
  id_cita: unknown;
  nom_bodega: unknown;
  bodega: unknown;
  descripcion_estado: unknown;
  fecha_cita: unknown;
  fecha_hora_ini: Date;
  placa: unknown;
  vh: unknown;
  nombre_cliente: unknown;
  nombre_encargado: unknown;
  descripcion_bahia: unknown;
  notas: unknown;
};

type VhSinOtRow = {
  fecha_cita: unknown;
  placa: unknown;
  bodega: unknown;
  nombre_cliente: unknown;
  nombre_encargado: unknown;
  descripcion_bahia: unknown;
  vh: unknown;
};

type VhSinCitaRow = {
  placa: unknown;
  nombre_cliente: unknown;
  motivo_visita: unknown;
  fecha_cita: unknown;
  bodegas: unknown;
};

@Injectable()
export class EntradaVehiculoPrismaRepository implements IEntradaVehiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private bodegaIn(column: string, ids: number[]): Prisma.Sql {
    if (ids.length === 0) {
      return Prisma.sql`1 = 0`;
    }
    return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(ids)})`;
  }

  private mapCita(row: CitaRow): CitaEntradaEntity {
    return {
      idCita: toNum(row.id_cita),
      nomBodega: toStr(row.nom_bodega),
      bodega: toNum(row.bodega),
      descripcionEstado: toStr(row.descripcion_estado),
      fechaCita: toStr(row.fecha_cita),
      fechaHoraIni: row.fecha_hora_ini,
      placa: toStr(row.placa),
      vehiculo: row.vh != null ? toStr(row.vh) : null,
      nombreCliente:
        row.nombre_cliente != null ? toStr(row.nombre_cliente) : null,
      nombreEncargado:
        row.nombre_encargado != null ? toStr(row.nombre_encargado) : null,
      descripcionBahia:
        row.descripcion_bahia != null ? toStr(row.descripcion_bahia) : null,
      notas: row.notas != null ? toStr(row.notas) : null,
    };
  }

  async getSedesUsuario(nitUsuario: number): Promise<SedeUsuarioEntity[]> {
    const rows = await this.prisma.$queryRaw<
      {
        idsede: unknown;
        nombres: unknown;
        descripcion: unknown;
        idsede_v: unknown;
      }[]
    >(Prisma.sql`
      SELECT
        usede.idsede,
        t.nombres,
        b.descripcion,
        CONVERT(VARCHAR, usede.idsede) AS idsede_v
      FROM sw_usuariosede usede
      INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
      INNER JOIN terceros t ON t.nit_real = su.nit_usuario
      INNER JOIN bodegas b ON usede.idsede = b.bodega
      WHERE t.nit_real = ${nitUsuario}
    `);

    return (rows ?? []).map((r) => ({
      idsede: toNum(r.idsede),
      idsedeV: toStr(r.idsede_v ?? r.idsede),
      nombres: toStr(r.nombres),
      descripcion: toStr(r.descripcion),
    }));
  }

  async getCitasEntradaVh(bodegaIds: number[]): Promise<CitaEntradaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<CitaRow[]>(Prisma.sql`
      SELECT x.* FROM (
        SELECT
          a.id_cita,
          b.descripcion AS nom_bodega,
          a.bodega,
          descripcion_estado,
          CONVERT(VARCHAR, fecha_hora_ini, 0) AS fecha_cita,
          fecha_hora_ini,
          a.placa,
          f.descripcion AS vh,
          nombre_cliente,
          nombre_encargado,
          descripcion_bahia,
          (SELECT TOP 1 solicitud FROM tall_citas_lista_chequeo ch WHERE a.id_cita = ch.Id_Cita) AS notas
        FROM tall_citas a
        INNER JOIN bodegas b ON a.bodega = b.bodega
        LEFT JOIN v_vh_vehiculos v ON a.placa = v.placa
        LEFT JOIN vh_modelo m ON v.modelo = m.modelo
        LEFT JOIN vh_familias f ON m.familia = f.familia
        WHERE CONVERT(DATE, fecha_hora_ini) = CONVERT(DATE, GETDATE())
          AND ${this.bodegaIn('a.bodega', bodegaIds)}
          AND id_cita NOT IN (SELECT id_cita FROM postv_entrada_vh_taller)
      ) x
      WHERE notas <> 'Tiempo Adicional' AND x.placa <> ''
      ORDER BY fecha_hora_ini ASC
    `);

    return (rows ?? []).map((r) => this.mapCita(r));
  }

  async getCitasEntradaVhAtendidas(
    bodegaIds: number[],
  ): Promise<CitaEntradaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<CitaRow[]>(Prisma.sql`
      SELECT x.* FROM (
        SELECT
          a.id_cita,
          b.descripcion AS nom_bodega,
          a.bodega,
          descripcion_estado,
          CONVERT(VARCHAR, fecha_hora_ini, 0) AS fecha_cita,
          fecha_hora_ini,
          a.placa,
          f.descripcion AS vh,
          nombre_cliente,
          nombre_encargado,
          descripcion_bahia,
          (SELECT TOP 1 solicitud FROM tall_citas_lista_chequeo ch WHERE a.id_cita = ch.Id_Cita) AS notas
        FROM tall_citas a
        INNER JOIN bodegas b ON a.bodega = b.bodega
        LEFT JOIN v_vh_vehiculos v ON a.placa = v.placa
        LEFT JOIN vh_modelo m ON v.modelo = m.modelo
        LEFT JOIN vh_familias f ON m.familia = f.familia
        WHERE CONVERT(DATE, fecha_hora_ini) = CONVERT(DATE, GETDATE())
          AND ${this.bodegaIn('a.bodega', bodegaIds)}
      ) x
      WHERE notas <> 'Tiempo Adicional' AND x.placa <> ''
      ORDER BY fecha_hora_ini ASC
    `);

    return (rows ?? []).map((r) => this.mapCita(r));
  }

  async getCitasEntradaVhPlaca(
    bodegaIds: number[],
    placa: string,
  ): Promise<CitaEntradaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<CitaRow[]>(Prisma.sql`
      SELECT TOP 1 x.* FROM (
        SELECT
          a.id_cita,
          b.descripcion AS nom_bodega,
          a.bodega,
          descripcion_estado,
          CONVERT(VARCHAR, fecha_hora_ini, 0) AS fecha_cita,
          fecha_hora_ini,
          a.placa,
          f.descripcion AS vh,
          nombre_cliente,
          nombre_encargado,
          descripcion_bahia,
          (SELECT TOP 1 solicitud FROM tall_citas_lista_chequeo ch WHERE a.id_cita = ch.Id_Cita) AS notas
        FROM tall_citas a
        INNER JOIN bodegas b ON a.bodega = b.bodega
        LEFT JOIN v_vh_vehiculos v ON a.placa = v.placa
        LEFT JOIN vh_modelo m ON v.modelo = m.modelo
        LEFT JOIN vh_familias f ON m.familia = f.familia
        WHERE ${this.bodegaIn('a.bodega', bodegaIds)}
          AND a.placa = ${placa}
      ) x
      WHERE notas <> 'Tiempo Adicional'
      ORDER BY fecha_hora_ini DESC
    `);

    return (rows ?? []).map((r) => this.mapCita(r));
  }

  async getCitasEntradaVhFecha(
    bodegaIds: number[],
    fecha: string,
  ): Promise<CitaEntradaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<CitaRow[]>(Prisma.sql`
      SELECT x.* FROM (
        SELECT
          a.id_cita,
          b.descripcion AS nom_bodega,
          a.bodega,
          descripcion_estado,
          CONVERT(VARCHAR, fecha_hora_ini, 0) AS fecha_cita,
          fecha_hora_ini,
          a.placa,
          f.descripcion AS vh,
          nombre_cliente,
          nombre_encargado,
          descripcion_bahia,
          (SELECT TOP 1 solicitud FROM tall_citas_lista_chequeo ch WHERE a.id_cita = ch.Id_Cita) AS notas
        FROM tall_citas a
        INNER JOIN bodegas b ON a.bodega = b.bodega
        LEFT JOIN v_vh_vehiculos v ON a.placa = v.placa
        LEFT JOIN vh_modelo m ON v.modelo = m.modelo
        LEFT JOIN vh_familias f ON m.familia = f.familia
        WHERE CONVERT(DATE, fecha_hora_ini) = CONVERT(DATE, ${fecha})
          AND ${this.bodegaIn('a.bodega', bodegaIds)}
          AND a.estado_cita != 'C'
          AND id_cita NOT IN (SELECT id_cita FROM postv_entrada_vh_taller)
      ) x
      WHERE notas <> 'Tiempo Adicional' AND x.placa <> ''
      ORDER BY fecha_hora_ini ASC
    `);

    return (rows ?? []).map((r) => this.mapCita(r));
  }

  async getVhSinOt(bodegaIds: number[]): Promise<VhSinOtEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<VhSinOtRow[]>(Prisma.sql`
      SELECT DISTINCT
        tc.fecha_hora_ini,
        CONVERT(VARCHAR, tc.fecha_hora_ini, 0) AS fecha_cita,
        tc.placa,
        tc.bodega,
        f.descripcion AS vh,
        tc.nombre_cliente,
        tc.nombre_encargado,
        tc.descripcion_bahia,
        tc.codigo_veh
      FROM postv_entrada_vh_taller vht
      INNER JOIN tall_citas tc ON vht.id_cita = tc.id_cita
      LEFT JOIN v_vh_vehiculos vhv ON vhv.placa = tc.placa
      INNER JOIN bodegas b ON b.bodega = tc.bodega
      LEFT JOIN vh_modelo m ON vhv.modelo = m.modelo
      LEFT JOIN vh_familias f ON m.familia = f.familia
      LEFT JOIN tall_encabeza_orden teo ON teo.serie = vhv.codigo
      WHERE CONVERT(DATE, tc.fecha_hora_ini) = CONVERT(DATE, GETDATE())
        AND tc.estado_cita != 'C'
        AND ${this.bodegaIn('b.bodega', bodegaIds)}
        AND teo.serie NOT IN (
          SELECT serie FROM tall_encabeza_orden WHERE CONVERT(DATE, entrada) = GETDATE()
        )
    `);

    return (rows ?? []).map((r) => ({
      fecha: toStr(r.fecha_cita),
      placa: toStr(r.placa),
      bodega: toNum(r.bodega),
      cliente: r.nombre_cliente != null ? toStr(r.nombre_cliente) : null,
      encargado: r.nombre_encargado != null ? toStr(r.nombre_encargado) : null,
      bahia: r.descripcion_bahia != null ? toStr(r.descripcion_bahia) : null,
      vh: r.vh != null ? toStr(r.vh) : null,
    }));
  }

  async getVhSinOtPlaca(
    bodegaIds: number[],
    placa: string,
  ): Promise<VhSinOtEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<VhSinOtRow[]>(Prisma.sql`
      SELECT DISTINCT TOP 1
        tc.fecha_hora_ini,
        CONVERT(VARCHAR, tc.fecha_hora_ini, 0) AS fecha_cita,
        tc.placa,
        tc.bodega,
        f.descripcion AS vh,
        tc.nombre_cliente,
        tc.nombre_encargado,
        tc.descripcion_bahia,
        tc.codigo_veh
      FROM postv_entrada_vh_taller vht
      INNER JOIN tall_citas tc ON vht.id_cita = tc.id_cita
      LEFT JOIN v_vh_vehiculos vhv ON vhv.placa = tc.placa
      INNER JOIN bodegas b ON b.bodega = tc.bodega
      LEFT JOIN vh_modelo m ON vhv.modelo = m.modelo
      LEFT JOIN vh_familias f ON m.familia = f.familia
      LEFT JOIN tall_encabeza_orden teo ON teo.serie = vhv.codigo
      WHERE tc.estado_cita != 'C'
        AND tc.placa = ${placa}
        AND ${this.bodegaIn('b.bodega', bodegaIds)}
        AND teo.serie NOT IN (
          SELECT serie FROM tall_encabeza_orden WHERE CONVERT(DATE, entrada) = GETDATE()
        )
      ORDER BY fecha_cita DESC
    `);

    return (rows ?? []).map((r) => ({
      fecha: toStr(r.fecha_cita),
      placa: toStr(r.placa),
      bodega: toNum(r.bodega),
      cliente: r.nombre_cliente != null ? toStr(r.nombre_cliente) : null,
      encargado: r.nombre_encargado != null ? toStr(r.nombre_encargado) : null,
      bahia: r.descripcion_bahia != null ? toStr(r.descripcion_bahia) : null,
      vh: r.vh != null ? toStr(r.vh) : null,
    }));
  }

  async getVhSinCita(bodegaIds: number[]): Promise<VhSinCitaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<VhSinCitaRow[]>(Prisma.sql`
      SELECT
        placa,
        nombre_cliente,
        motivo_visita,
        CONVERT(VARCHAR, fecha, 0) AS fecha_cita,
        bodegas
      FROM postv_vh_sin_cita
      WHERE ${this.bodegaIn('bodegas', bodegaIds)}
        AND MONTH(CONVERT(DATE, fecha)) = MONTH(GETDATE())
        AND YEAR(CONVERT(DATE, fecha)) = YEAR(GETDATE())
        AND DAY(CONVERT(DATE, fecha)) = DAY(GETDATE())
      ORDER BY fecha_cita DESC
    `);

    return (rows ?? []).map((r) => ({
      placa: toStr(r.placa),
      nombreCliente: toStr(r.nombre_cliente),
      motivoVisita: toStr(r.motivo_visita),
      fecha: toStr(r.fecha_cita),
      bodegas: r.bodegas != null ? toStr(r.bodegas) : null,
    }));
  }

  async getVhSinCitaPlaca(
    bodegaIds: number[],
    placa: string,
  ): Promise<VhSinCitaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<VhSinCitaRow[]>(Prisma.sql`
      SELECT
        placa,
        nombre_cliente,
        motivo_visita,
        CONVERT(VARCHAR, fecha, 0) AS fecha_cita,
        bodegas
      FROM postv_vh_sin_cita
      WHERE ${this.bodegaIn('bodegas', bodegaIds)}
        AND MONTH(CONVERT(DATE, fecha)) = MONTH(GETDATE())
        AND YEAR(CONVERT(DATE, fecha)) = YEAR(GETDATE())
        AND DAY(CONVERT(DATE, fecha)) = DAY(GETDATE())
        AND placa = ${placa}
      ORDER BY fecha_cita DESC
    `);

    return (rows ?? []).map((r) => ({
      placa: toStr(r.placa),
      nombreCliente: toStr(r.nombre_cliente),
      motivoVisita: toStr(r.motivo_visita),
      fecha: toStr(r.fecha_cita),
      bodegas: r.bodegas != null ? toStr(r.bodegas) : null,
    }));
  }

  async getCitaFechaHoraIni(idCita: number): Promise<Date | null> {
    const rows = await this.prisma.$queryRaw<{ fecha_hora_ini: Date }[]>(
      Prisma.sql`
        SELECT fecha_hora_ini
        FROM tall_citas
        WHERE id_cita = ${idCita}
      `,
    );
    return rows[0]?.fecha_hora_ini ?? null;
  }

  async insertEntradaVh(idCita: number): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO postv_entrada_vh_taller (id_cita, fecha_hora)
        VALUES (${idCita}, SYSDATETIME())
      `);
      return true;
    } catch {
      return false;
    }
  }

  async insertVhSinCita(
    placa: string,
    cliente: string,
    motivo: string,
    bodega: number,
  ): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO postv_vh_sin_cita (placa, nombre_cliente, motivo_visita, fecha, bodegas)
        VALUES (${placa}, ${cliente}, ${motivo}, SYSDATETIME(), ${String(bodega)})
      `);
      return true;
    } catch {
      return false;
    }
  }
}
