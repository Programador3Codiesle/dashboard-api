import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  BODEGAS_EV_IDS,
  buildSolicitudWhere,
  BodegaRow,
  EntregaRepuestoRow,
  GestionRepuestoRow,
  IEntradasVariasRepository,
  ObservacionEvRow,
  OrdenTallerRow,
  RepuestoRefRow,
  SolicitudEvDetalleRow,
  SolicitudEvFiltros,
  SolicitudEvRow,
  StockReferenciaRow,
} from '../../domain/entradas-varias.repository';

@Injectable()
export class EntradasVariasPrismaRepository extends IEntradasVariasRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async obtenerOrden(nOrden: number): Promise<OrdenTallerRow | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        bodega: number;
        descripcion: string;
        serie: string;
        placa: string | null;
      }>
    >(Prisma.sql`
      SELECT o.bodega, b.descripcion, o.serie, r.placa
      FROM tall_encabeza_orden o
      LEFT JOIN referencias_imp r ON o.serie = r.codigo
      LEFT JOIN bodegas b ON o.bodega = b.bodega
      WHERE o.numero = ${nOrden}
    `);
    return rows[0] ?? null;
  }

  async validarRepuesto(codigo: string): Promise<RepuestoRefRow | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{ codigo: string; descripcion: string }>
    >(Prisma.sql`
      SELECT rf.codigo, rf.descripcion
      FROM referencias rf
      WHERE rf.codigo = ${codigo}
        AND rf.maneja_inventario = 1
        AND rf.conversion <> -1
    `);
    return rows[0] ?? null;
  }

  async listarBodegas(): Promise<BodegaRow[]> {
    return this.prisma.$queryRaw<BodegaRow[]>(Prisma.sql`
      SELECT bodega, descripcion
      FROM bodegas
      WHERE bodega IN (${Prisma.join(BODEGAS_EV_IDS)})
      ORDER BY descripcion ASC
    `);
  }

  async crearSolicitud(data: {
    nOrden: number;
    userRegister: number;
    obs: string;
    repuestos: Array<{ referencia: string; cantidad: number }>;
  }): Promise<number> {
    const now = new Date();
    const header = await this.prisma.postv_solicitud_entrada_varia.create({
      data: {
        n_orden: data.nOrden,
        user_register: data.userRegister,
        date_register: now,
        estado_auth: 0,
        obs_register: data.obs,
      },
    });

    try {
      for (const item of data.repuestos) {
        await this.prisma.postv_solicitud_entrada_varia_detail.create({
          data: {
            id_solicitud: header.id,
            referencia: item.referencia,
            cantidad: item.cantidad,
            estado_auth: 0,
          },
        });
      }
      return header.id;
    } catch {
      await this.prisma.postv_solicitud_entrada_varia.delete({
        where: { id: header.id },
      });
      throw new Error('Error al registrar repuestos de la solicitud');
    }
  }

  async listarSolicitudes(
    filtros: SolicitudEvFiltros,
  ): Promise<SolicitudEvRow[]> {
    const { sql } = buildSolicitudWhere(filtros);
    return this.prisma.$queryRaw<SolicitudEvRow[]>(Prisma.sql`
      SELECT
        ev.id,
        ev.n_orden,
        ev.user_register,
        ev.date_register,
        ev.user_auth,
        ev.date_auth,
        ev.estado_auth,
        ev.obs_register,
        ev.obs_auth,
        r.placa,
        t.nombres,
        tl.bodega,
        b.descripcion AS descripcion_bodega,
        t1.nombres AS nombres_auth,
        (SELECT TOP 1 tc1.e_mail FROM crm_contactos tc1 WHERE tc1.nit = t.nit) AS tc_email
      FROM postv_solicitud_entrada_varia ev
      LEFT JOIN tall_encabeza_orden tl ON ev.n_orden = tl.numero
      LEFT JOIN referencias_imp r ON tl.serie = r.codigo
      LEFT JOIN bodegas b ON tl.bodega = b.bodega
      LEFT JOIN w_sist_usuarios w ON ev.user_register = w.id_usuario
      LEFT JOIN terceros t ON w.nit_usuario = t.nit
      LEFT JOIN w_sist_usuarios w1 ON ev.user_auth = w1.id_usuario
      LEFT JOIN terceros t1 ON w1.nit_usuario = t1.nit
      WHERE ${sql}
      ORDER BY ev.estado_auth ASC, ev.id ASC
    `);
  }

  async obtenerDetalleSolicitud(
    idSolicitud: number,
  ): Promise<SolicitudEvDetalleRow[]> {
    return this.prisma.$queryRaw<SolicitudEvDetalleRow[]>(Prisma.sql`
      SELECT
        evd.id,
        evd.id_solicitud,
        evd.referencia,
        r.descripcion,
        evd.cantidad,
        evd.estado_auth,
        evd.numero_ev,
        evd.tipo_ev,
        evd.numero_sv,
        evd.tipo_sv,
        evd.numero_o_ev,
        evd.numero_o_sv,
        evd.date_ev,
        evd.date_sv,
        evd.entregado,
        t.nombres AS user_ev,
        t1.nombres AS user_sv,
        t2.nombres AS user_rpto
      FROM postv_solicitud_entrada_varia_detail evd
      INNER JOIN referencias r ON evd.referencia = r.codigo
      LEFT JOIN w_sist_usuarios w ON evd.user_e = w.id_usuario
      LEFT JOIN terceros t ON w.nit_usuario = t.nit
      LEFT JOIN w_sist_usuarios w1 ON evd.user_s = w1.id_usuario
      LEFT JOIN terceros t1 ON w1.nit_usuario = t1.nit
      LEFT JOIN w_sist_usuarios w2 ON evd.user_e_rpto = w2.id_usuario
      LEFT JOIN terceros t2 ON w2.nit_usuario = t2.nit
      WHERE evd.id_solicitud = ${idSolicitud}
    `);
  }

  async obtenerSolicitudPorId(
    idSolicitud: number,
  ): Promise<SolicitudEvRow | null> {
    const rows = await this.listarSolicitudes({ idSolicitud });
    return rows[0] ?? null;
  }

  async actualizarDetalleAuth(
    idDetalle: number,
    idSolicitud: number,
    estadoAuth: number,
  ): Promise<boolean> {
    const result =
      await this.prisma.postv_solicitud_entrada_varia_detail.updateMany({
        where: { id: idDetalle, id_solicitud: idSolicitud },
        data: { estado_auth: estadoAuth },
      });
    return result.count > 0;
  }

  async cerrarAuthSolicitud(
    idSolicitud: number,
    userAuth: number,
    obsAuth: string,
    estadoAuth: number,
  ): Promise<boolean> {
    const result = await this.prisma.postv_solicitud_entrada_varia.updateMany({
      where: { id: idSolicitud, estado_auth: 0 },
      data: {
        user_auth: userAuth,
        obs_auth: obsAuth,
        date_auth: new Date(),
        estado_auth: estadoAuth,
      },
    });
    return result.count > 0;
  }

  async contarDetalleAuth(idSolicitud: number): Promise<{
    total: number;
    pendientes: number;
    autorizadas: number;
    rechazadas: number;
  }> {
    const rows =
      await this.prisma.postv_solicitud_entrada_varia_detail.findMany({
        where: { id_solicitud: idSolicitud },
        select: { estado_auth: true },
      });
    type AuthRow = { estado_auth: number | null };
    return {
      total: rows.length,
      pendientes: rows.filter(
        (r: AuthRow) => r.estado_auth == null || r.estado_auth === 0,
      ).length,
      autorizadas: rows.filter((r: AuthRow) => r.estado_auth === 1).length,
      rechazadas: rows.filter((r: AuthRow) => r.estado_auth === 2).length,
    };
  }

  async registrarEntradaVaria(data: {
    idSolicitud: number;
    idDetalle: number;
    userId: number;
    tipoEv: string;
    numeroEv: number;
    numeroOrdenEv: number;
    obs: string;
  }): Promise<boolean> {
    const now = new Date();
    const result =
      await this.prisma.postv_solicitud_entrada_varia_detail.updateMany({
        where: {
          id: data.idDetalle,
          id_solicitud: data.idSolicitud,
          estado_auth: 1,
          date_ev: null,
        },
        data: {
          numero_ev: data.numeroEv,
          tipo_ev: data.tipoEv,
          numero_o_ev: data.numeroOrdenEv,
          date_ev: now,
          user_e: data.userId,
        },
      });

    if (result.count === 0) return false;

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_solicitud_entrada_varia_detail_obs (id_solicitud, id_detalle, tipo, obs)
      VALUES (${data.idSolicitud}, ${data.idDetalle}, 0, ${data.obs})
    `);
    return true;
  }

  async registrarSalidaVaria(data: {
    idSolicitud: number;
    idDetalle: number;
    userId: number;
    tipoSv: string;
    numeroSv: number;
    numeroOrdenSv: number;
    obs: string;
  }): Promise<boolean> {
    const now = new Date();
    const result =
      await this.prisma.postv_solicitud_entrada_varia_detail.updateMany({
        where: {
          id: data.idDetalle,
          id_solicitud: data.idSolicitud,
          estado_auth: 1,
          date_sv: null,
        },
        data: {
          numero_sv: data.numeroSv,
          tipo_sv: data.tipoSv,
          numero_o_sv: data.numeroOrdenSv,
          date_sv: now,
          user_s: data.userId,
        },
      });

    if (result.count === 0) return false;

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_solicitud_entrada_varia_detail_obs (id_solicitud, id_detalle, tipo, obs)
      VALUES (${data.idSolicitud}, ${data.idDetalle}, 1, ${data.obs})
    `);
    return true;
  }

  async marcarEntregado(idDetalle: number, userId: number): Promise<boolean> {
    const result =
      await this.prisma.postv_solicitud_entrada_varia_detail.updateMany({
        where: {
          id: idDetalle,
          estado_auth: 1,
          date_e_rpto: null,
          numero_sv: { not: null },
        },
        data: {
          entregado: 1,
          date_e_rpto: new Date(),
          user_e_rpto: userId,
        },
      });
    return result.count > 0;
  }

  async pendientesEntrega(idSolicitud: number): Promise<number> {
    return this.prisma.postv_solicitud_entrada_varia_detail.count({
      where: {
        id_solicitud: idSolicitud,
        estado_auth: 1,
        entregado: null,
      },
    });
  }

  async stockReferencia(referencia: string): Promise<StockReferenciaRow[]> {
    return this.prisma.$queryRaw<StockReferenciaRow[]>(Prisma.sql`
      SELECT s.stock, s.bodega, b.descripcion
      FROM v_referencias_sto_hoy s
      LEFT JOIN bodegas b ON s.bodega = b.bodega
      WHERE s.ano = YEAR(GETDATE())
        AND s.mes = MONTH(GETDATE())
        AND s.codigo = ${referencia}
        AND s.bodega <> 99
    `);
  }

  async gestionRepuestos(idSolicitud: number): Promise<GestionRepuestoRow[]> {
    return this.prisma.$queryRaw<GestionRepuestoRow[]>(Prisma.sql`
      SELECT tipo_ev, numero_ev, tipo_sv, numero_sv, numero_o_sv
      FROM postv_solicitud_entrada_varia_detail
      WHERE id_solicitud = ${idSolicitud}
        AND estado_auth = 1
        AND numero_ev IS NOT NULL
      GROUP BY tipo_ev, numero_ev, tipo_sv, numero_sv, numero_o_sv
    `);
  }

  async entregaRepuestos(
    idSolicitud: number,
    tipoSv: string,
    numeroSv: number,
    numeroOSv: number,
  ): Promise<EntregaRepuestoRow[]> {
    return this.prisma.$queryRaw<EntregaRepuestoRow[]>(Prisma.sql`
      SELECT numero_o_sv, referencia, entregado
      FROM postv_solicitud_entrada_varia_detail
      WHERE id_solicitud = ${idSolicitud}
        AND estado_auth = 1
        AND tipo_sv = ${tipoSv}
        AND numero_sv = ${numeroSv}
        AND numero_o_sv = ${numeroOSv}
    `);
  }

  async observacionesPorSolicitud(
    idSolicitud: number,
    tipo: number,
  ): Promise<ObservacionEvRow[]> {
    return this.prisma.$queryRaw<ObservacionEvRow[]>(Prisma.sql`
      SELECT o.id_detalle, o.obs, evd.referencia
      FROM postv_solicitud_entrada_varia_detail_obs o
      LEFT JOIN postv_solicitud_entrada_varia_detail evd ON evd.id = o.id_detalle
      WHERE o.id_solicitud = ${idSolicitud}
        AND o.tipo = ${tipo}
      ORDER BY evd.referencia ASC, o.id ASC
    `);
  }

  async detalleParaCorreoEv(
    idSolicitud: number,
  ): Promise<SolicitudEvDetalleRow[]> {
    return this.prisma.$queryRaw<SolicitudEvDetalleRow[]>(Prisma.sql`
      SELECT evd.id, evd.id_solicitud, evd.referencia, r.descripcion, evd.cantidad,
        evd.estado_auth, evd.numero_ev, evd.tipo_ev, evd.numero_sv, evd.tipo_sv,
        evd.numero_o_ev, evd.numero_o_sv, evd.date_ev, evd.date_sv, evd.entregado,
        NULL AS user_ev, NULL AS user_sv, NULL AS user_rpto
      FROM postv_solicitud_entrada_varia_detail evd
      INNER JOIN referencias r ON evd.referencia = r.codigo
      WHERE evd.id_solicitud = ${idSolicitud}
        AND evd.estado_auth = 1
        AND evd.numero_ev IS NOT NULL
        AND evd.tipo_ev IS NOT NULL
    `);
  }

  async detalleParaCorreoSv(
    idSolicitud: number,
    idDetalle: number,
  ): Promise<SolicitudEvDetalleRow[]> {
    return this.prisma.$queryRaw<SolicitudEvDetalleRow[]>(Prisma.sql`
      SELECT evd.id, evd.id_solicitud, evd.referencia, r.descripcion, evd.cantidad,
        evd.estado_auth, evd.numero_ev, evd.tipo_ev, evd.numero_sv, evd.tipo_sv,
        evd.numero_o_ev, evd.numero_o_sv, evd.date_ev, evd.date_sv, evd.entregado,
        NULL AS user_ev, NULL AS user_sv, NULL AS user_rpto
      FROM postv_solicitud_entrada_varia_detail evd
      INNER JOIN referencias r ON evd.referencia = r.codigo
      WHERE evd.id_solicitud = ${idSolicitud}
        AND evd.id = ${idDetalle}
        AND evd.estado_auth = 1
        AND evd.numero_sv IS NOT NULL
        AND evd.tipo_sv IS NOT NULL
    `);
  }
}
