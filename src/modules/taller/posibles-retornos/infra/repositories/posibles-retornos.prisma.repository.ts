import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { BODEGAS_CODIESEL_IDS } from '../../../informe-posibles-retornos/domain/constants/bodegas-codiesel.constants';
import {
  CatalogosPosiblesRetornosEntity,
  DetalleClienteEntity,
  DetalleOrdenEntity,
  DetallePlacaEntity,
  DetalleTecnicoEntity,
  GuardarDefinicionInputEntity,
  ListarPosiblesRetornosResultEntity,
  PosibleRetornoFilaEntity,
  SolucionRetornoEntity,
} from '../../domain/entities/posibles-retornos.entity';
import {
  IPosiblesRetornosRepository,
  ListarPosiblesRetornosFilters,
} from '../../domain/repositories/posibles-retornos.repository.interface';
import {
  toNum,
  toStr,
} from '../../../entrada-vehiculo/infra/repositories/shared.utils';

@Injectable()
export class PosiblesRetornosPrismaRepository implements IPosiblesRetornosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerCatalogos(): Promise<CatalogosPosiblesRetornosEntity> {
    const razones = await this.prisma.$queryRaw<
      { id_razon: unknown; razon: unknown; definicion: unknown }[]
    >(
      Prisma.sql`SELECT id_razon, razon, definicion FROM postv_posible_razon_retorno`,
    );
    const sistemas = await this.prisma.$queryRaw<
      { id_sistema_inv: unknown; sistema_inv: unknown }[]
    >(
      Prisma.sql`SELECT id_sistema_inv, sistema_inv FROM postv_posible_sistema_inv`,
    );
    const planes = await this.prisma.$queryRaw<
      { id_plan: unknown; plan_accion: unknown }[]
    >(Prisma.sql`SELECT id_plan, plan_accion FROM postv_posible_plan_accion`);
    const bodegas = await this.prisma.$queryRaw<
      { bodega: unknown; descripcion: unknown }[]
    >(
      Prisma.sql`
        SELECT bodega, descripcion FROM bodegas
        WHERE bodega IN (${Prisma.join([...BODEGAS_CODIESEL_IDS])})
      `,
    );

    return {
      razones: (razones ?? []).map((r) => ({
        id_razon: toNum(r.id_razon),
        razon: toStr(r.razon),
        definicion: toNum(r.definicion),
      })),
      sistemas: (sistemas ?? []).map((s) => ({
        id_sistema_inv: toNum(s.id_sistema_inv),
        sistema_inv: toStr(s.sistema_inv),
      })),
      planes: (planes ?? []).map((p) => ({
        id_plan: toNum(p.id_plan),
        plan_accion: toStr(p.plan_accion),
      })),
      bodegas: (bodegas ?? []).map((b) => ({
        bodega: toNum(b.bodega),
        descripcion: toStr(b.descripcion),
      })),
    };
  }

  async listar(
    filters: ListarPosiblesRetornosFilters,
  ): Promise<ListarPosiblesRetornosResultEntity> {
    const conditions: Prisma.Sql[] = [Prisma.sql`v.numero > 0`];

    if (filters.numero != null && Number.isFinite(filters.numero)) {
      conditions.push(Prisma.sql`v.numero = ${filters.numero}`);
    }
    if (filters.placa) {
      conditions.push(Prisma.sql`v.placa = ${filters.placa}`);
    }
    if (
      filters.bodega != null &&
      Number.isFinite(filters.bodega) &&
      filters.bodega !== -1
    ) {
      conditions.push(Prisma.sql`v.bodega = ${String(filters.bodega)}`);
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    const baseSql = Prisma.sql`
      SELECT ROW_NUMBER() OVER (ORDER BY v.numero DESC) AS rn, v.*, b.descripcion
      FROM v_posibles_retornos v
      LEFT JOIN bodegas b ON b.bodega = v.bodega
      WHERE ${whereClause}
    `;

    const countRows = await this.prisma.$queryRaw<{ total: unknown }[]>(
      Prisma.sql`SELECT COUNT(*) AS total FROM (${baseSql}) AS cnt`,
    );
    const total = toNum(countRows?.[0]?.total);

    let length = filters.length;
    if (length === -1) {
      length = total;
    }

    const start = filters.start;
    const limiteFinal = start + length;

    const pageRows = await this.prisma.$queryRaw<
      {
        rn: unknown;
        numero: unknown;
        placa: unknown;
        des_modelo: unknown;
        origen: unknown;
        descripcion: unknown;
        estado: unknown;
      }[]
    >(Prisma.sql`
      SELECT x.rn, x.numero, x.placa, x.des_modelo, x.origen, x.descripcion, x.estado
      FROM (${baseSql}) AS x
      WHERE x.rn > ${start} AND x.rn <= ${limiteFinal}
    `);

    const filas: PosibleRetornoFilaEntity[] = (pageRows ?? []).map((r) => ({
      rn: toNum(r.rn),
      numero: toNum(r.numero),
      placa: toStr(r.placa),
      des_modelo: toStr(r.des_modelo),
      origen: toStr(r.origen),
      descripcion: toStr(r.descripcion),
      estado: toStr(r.estado),
    }));

    return { total, filas };
  }

  async obtenerDetallePorPlaca(placa: string): Promise<DetallePlacaEntity> {
    const clienteRows = await this.prisma.$queryRaw<
      {
        placa: unknown;
        des_modelo: unknown;
        cliente: unknown;
        cant_retornos: unknown;
      }[]
    >(Prisma.sql`
      SELECT r.placa, r.des_modelo, t.nombres AS cliente, repeticiones AS cant_retornos
      FROM v_posibles_retornos r
      LEFT JOIN v_vh_vehiculos v ON r.placa = v.placa
      LEFT JOIN terceros t ON v.nit_comprador = t.nit
      LEFT JOIN v_repeticiones rp ON r.placa = rp.placa
      WHERE r.placa = ${placa}
    `);

    const first = clienteRows?.[0];
    if (!first) {
      throw new Error('Cliente no encontrado');
    }

    const cliente: DetalleClienteEntity = {
      placa: toStr(first.placa),
      des_modelo: toStr(first.des_modelo),
      cliente: toStr(first.cliente),
      cant_retornos: toNum(first.cant_retornos),
    };

    const ordenRows = await this.prisma.$queryRaw<
      {
        rnk: unknown;
        placa: unknown;
        numero: unknown;
        solicitud: unknown;
        respuesta: unknown;
      }[]
    >(Prisma.sql`
      SELECT a.rnk, a.placa, a.numero, tl.solicitud, tl.respuesta
      FROM (
        SELECT rnk = ROW_NUMBER() OVER (PARTITION BY te.serie ORDER BY CONVERT(DATE, entrada) DESC),
          r.placa, te.numero
        FROM v_posibles_retornos r
        INNER JOIN v_vh_vehiculos v ON r.placa = v.placa
        INNER JOIN tall_encabeza_orden te ON v.codigo = te.serie
        WHERE r.placa = ${placa}
      ) a
      INNER JOIN tall_lista_chequeo tl ON a.numero = tl.numero
      WHERE rnk <= 5
      ORDER BY a.rnk
    `);

    const tecnicoRows = await this.prisma.$queryRaw<
      {
        rnk: unknown;
        placa: unknown;
        numero: unknown;
        tecnicos: unknown;
      }[]
    >(Prisma.sql`
      SELECT DISTINCT a.rnk, a.placa, a.numero, t.nombres AS tecnicos
      FROM (
        SELECT rnk = ROW_NUMBER() OVER (PARTITION BY te.serie ORDER BY CONVERT(DATE, entrada) DESC),
          r.placa, te.numero
        FROM v_posibles_retornos r
        INNER JOIN v_vh_vehiculos v ON r.placa = v.placa
        INNER JOIN tall_encabeza_orden te ON v.codigo = te.serie
        WHERE r.placa = ${placa}
      ) a
      INNER JOIN tall_detalle_orden td ON a.numero = td.numero
      INNER JOIN terceros t ON td.operario = t.nit
      WHERE rnk <= 5 AND td.clase_operacion = 'T'
      ORDER BY a.rnk
    `);

    const ordenes: DetalleOrdenEntity[] = (ordenRows ?? []).map((o) => ({
      rnk: toNum(o.rnk),
      placa: toStr(o.placa),
      numero: toNum(o.numero),
      solicitud: toStr(o.solicitud),
      respuesta: toStr(o.respuesta),
    }));

    const tecnicos: DetalleTecnicoEntity[] = (tecnicoRows ?? []).map((t) => ({
      rnk: toNum(t.rnk),
      placa: toStr(t.placa),
      numero: toNum(t.numero),
      tecnicos: toStr(t.tecnicos),
    }));

    const array_ordenes = [...new Set(ordenes.map((o) => o.numero))];
    const array_tecnicos = [
      ...new Set(tecnicos.map((t) => t.tecnicos).filter(Boolean)),
    ];

    return {
      cliente,
      ordenes,
      tecnicos,
      array_ordenes,
      array_tecnicos,
    };
  }

  async guardarDefinicion(
    data: GuardarDefinicionInputEntity,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_posible_retorno_definido (
        definicion, id_razon, obs_razon, id_sist_inv, obs_sist_inv,
        numero_retorno, numero, tecnico, id_plan, obs_plan,
        repuestos, mano_obra, tot, obs_costo, fecha_creacion, usuario
      ) VALUES (
        ${data.definicion},
        ${data.id_razon},
        ${data.obs_razon},
        ${data.id_sist_inv},
        ${data.obs_sist_inv},
        ${data.numero_retorno},
        ${data.numero},
        ${data.tecnico},
        ${data.id_plan},
        ${data.obs_plan},
        ${data.repuestos},
        ${data.mano_obra},
        ${data.tot},
        ${data.obs_costo},
        ${data.fecha_creacion},
        ${data.usuario}
      )
    `);

    return result > 0;
  }

  async obtenerSolucion(numero: number): Promise<SolucionRetornoEntity | null> {
    const rows = await this.prisma.$queryRaw<
      {
        numero: unknown;
        definicion: unknown;
        razon: unknown;
        obs_razon: unknown;
        sistema_inv: unknown;
        obs_sist_inv: unknown;
        plan_accion: unknown;
        obs_plan: unknown;
        repuestos: unknown;
        mano_obra: unknown;
        tot: unknown;
        obs_costo: unknown;
        tecnico: unknown;
        numero_retorno: unknown;
        fecha_creacion: unknown;
        nombres: unknown;
      }[]
    >(Prisma.sql`
      SELECT TOP 1 d.numero, d.definicion, ra.razon, d.obs_razon,
        si.sistema_inv, d.obs_sist_inv, pa.plan_accion, d.obs_plan,
        d.repuestos, d.mano_obra, d.tot, d.obs_costo, d.tecnico,
        d.numero_retorno, d.fecha_creacion, t.nombres
      FROM postv_posible_retorno_definido d
      LEFT JOIN postv_posible_plan_accion pa ON pa.id_plan = d.id_plan
      LEFT JOIN postv_posible_razon_retorno ra ON ra.id_razon = d.id_razon
      LEFT JOIN postv_posible_sistema_inv si ON si.id_sistema_inv = d.id_sist_inv
      LEFT JOIN terceros t ON t.nit = d.usuario
      WHERE d.numero = ${numero}
      ORDER BY d.id_return DESC
    `);

    const row = rows?.[0];
    if (!row) return null;

    return {
      numero: row.numero != null ? toNum(row.numero) : null,
      definicion: row.definicion != null ? toNum(row.definicion) : null,
      razon: row.razon != null ? toStr(row.razon) : null,
      obs_razon: row.obs_razon != null ? toStr(row.obs_razon) : null,
      sistema_inv: row.sistema_inv != null ? toStr(row.sistema_inv) : null,
      obs_sist_inv: row.obs_sist_inv != null ? toStr(row.obs_sist_inv) : null,
      plan_accion: row.plan_accion != null ? toStr(row.plan_accion) : null,
      obs_plan: row.obs_plan != null ? toStr(row.obs_plan) : null,
      repuestos: row.repuestos != null ? toNum(row.repuestos) : null,
      mano_obra: row.mano_obra != null ? toNum(row.mano_obra) : null,
      tot: row.tot != null ? toNum(row.tot) : null,
      obs_costo: row.obs_costo != null ? toStr(row.obs_costo) : null,
      tecnico: row.tecnico != null ? toStr(row.tecnico) : null,
      numero_retorno:
        row.numero_retorno != null ? toNum(row.numero_retorno) : null,
      fecha_creacion:
        row.fecha_creacion != null ? toStr(row.fecha_creacion) : null,
      nombres: row.nombres != null ? toStr(row.nombres) : null,
    };
  }

  async cerrarBdc(
    idPosibleBdc: number,
    usuario: string,
    fecha: string,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_posible_retorno_bdc (id_posible_bdc, usuario, fecha)
      VALUES (${idPosibleBdc}, ${usuario}, ${fecha})
    `);
    return result > 0;
  }
}
