import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { CODIESEL_EMPRESA_ID } from '../../../../../core/config/empresa-sesion';
import {
  IGestionCompraRepository,
  ListarComprasFiltros,
  CotizacionGestCompra,
  ListarComprasResult,
  MensajeCompra,
  MensajeExcelCompra,
  UsuarioGerenteCombo,
} from '../../domain/gestion-compra.repository';
import { GestionCompraEntity } from '../../domain/gestion-compra.entity';

/** Día calendario en América/Bogotá. date('Y-m-d') del legacy. */
function fechaCalendarioBogota(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}

/**
 * Fecha elegida en el formulario (YYYY-MM-DD). new Date('YYYY-MM-DD') es
 * medianoche UTC; se guarda ese día, sin pasarlo a Bogotá.
 */
function fechaTentativaGuardada(value: Date | undefined): string {
  if (!value) return fechaCalendarioBogota(new Date());
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class GestionCompraPrismaRepository implements IGestionCompraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Partial<GestionCompraEntity>,
  ): Promise<{ status: boolean; message: string; data?: GestionCompraEntity }> {
    const fechaSolicitud = fechaCalendarioBogota(
      data.fecha_solicitud ?? new Date(),
    );
    const fechaTentativa = fechaTentativaGuardada(data.fecha_tentativa);

    const tryInsert = async (includeIdEmpresa: boolean) => {
      if (includeIdEmpresa && data.id_empresa != null) {
        return this.prisma.$queryRaw<any[]>`
                    INSERT INTO postv_gestion_compras 
                    (fecha_solicitud, area, sede, usu_solicita, cargo_usu_solicita, gerente_autoriza,
                     descri_prod, caracteristicas, proveedor, area_cargar, urgencia, fecha_tentativa,
                     estado, estado_autorizacion, con_factura, id_empresa)
                    OUTPUT INSERTED.*
                    VALUES 
                    (${fechaSolicitud}, ${data.area}, ${data.sede}, ${data.usu_solicita},
                     ${data.cargo_usu_solicita}, ${data.gerente_autoriza ?? null}, ${data.descri_prod},
                     ${data.caracteristicas ?? ''},
                     ${data.proveedor ?? null},
                     ${data.area_cargar ?? null},
                     ${data.urgencia}, ${fechaTentativa}, ${data.estado || 1},
                     ${data.estado_autorizacion || 0}, ${data.con_factura ?? null}, ${data.id_empresa})
                `;
      }
      return this.prisma.$queryRaw<any[]>`
                INSERT INTO postv_gestion_compras 
                (fecha_solicitud, area, sede, usu_solicita, cargo_usu_solicita, gerente_autoriza,
                 descri_prod, caracteristicas, proveedor, area_cargar, urgencia, fecha_tentativa,
                 estado, estado_autorizacion, con_factura)
                OUTPUT INSERTED.*
                VALUES 
                (${fechaSolicitud}, ${data.area}, ${data.sede}, ${data.usu_solicita},
                 ${data.cargo_usu_solicita}, ${data.gerente_autoriza ?? null}, ${data.descri_prod},
                 ${data.caracteristicas ?? ''},
                 ${data.proveedor ?? null},
                 ${data.area_cargar ?? null},
                 ${data.urgencia}, ${fechaTentativa}, ${data.estado || 1},
                 ${data.estado_autorizacion || 0}, ${data.con_factura ?? null})
            `;
    };

    try {
      let result: any[];
      try {
        result = await tryInsert(true);
      } catch (firstErr: any) {
        const msg = firstErr?.message ?? String(firstErr);
        if (msg.includes('id_empresa') || msg.includes('Invalid column name')) {
          result = await tryInsert(false);
        } else {
          throw firstErr;
        }
      }

      const inserted = result[0];
      return {
        status: true,
        message: 'Solicitud de compra creada correctamente',
        data: this.mapToEntity(inserted),
      };
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al crear solicitud: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async listar(filtros?: ListarComprasFiltros): Promise<ListarComprasResult> {
    try {
      return await this.ejecutarListar(filtros, true);
    } catch (firstErr: unknown) {
      const msg =
        firstErr instanceof Error ? firstErr.message : String(firstErr);
      const sinColumnaEmpresa =
        msg.includes('id_empresa') || msg.includes('Invalid column name');
      if (!sinColumnaEmpresa) {
        throw firstErr;
      }
      // Sin columna: el histórico equivale a NULL → solo Codiesel (1).
      if (
        filtros?.id_empresa != null &&
        filtros.id_empresa !== CODIESEL_EMPRESA_ID
      ) {
        return {
          items: [],
          total: 0,
          page: filtros.pagina || 1,
          limit: filtros.limite || 10,
        };
      }
      return this.ejecutarListar(filtros, false);
    }
  }

  private async ejecutarListar(
    filtros: ListarComprasFiltros | undefined,
    filtrarEmpresa: boolean,
  ): Promise<ListarComprasResult> {
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

    if (filtros?.buscar) {
      const searchTerm = '%' + filtros.buscar + '%';
      conditions.push(
        Prisma.sql`(gc.descri_prod LIKE ${searchTerm} OR gc.area LIKE ${searchTerm} OR us.nombres LIKE ${searchTerm})`,
      );
    }

    if (filtros?.usu_solicita) {
      conditions.push(Prisma.sql`gc.usu_solicita = ${filtros.usu_solicita}`);
    }

    if (filtros?.estado !== undefined) {
      conditions.push(Prisma.sql`gc.estado = ${filtros.estado}`);
    }

    if (filtros?.estado_autorizacion !== undefined) {
      conditions.push(
        Prisma.sql`gc.estado_autorizacion = ${filtros.estado_autorizacion}`,
      );
    }

    if (filtrarEmpresa && filtros?.id_empresa != null) {
      conditions.push(
        Prisma.sql`ISNULL(gc.id_empresa, ${CODIESEL_EMPRESA_ID}) = ${filtros.id_empresa}`,
      );
    }

    const whereClause = Prisma.join(conditions, ' AND ');
    const limit = filtros?.limite || 10;
    const page = filtros?.pagina || 1;
    const offset = (page - 1) * limit;

    const totalResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
                SELECT COUNT(*) as total
                FROM postv_gestion_compras gc 
                INNER JOIN terceros us ON us.nit = gc.usu_solicita
                LEFT JOIN terceros ga ON ga.nit = gc.gerente_autoriza
                WHERE ${whereClause}
            `;
    const total = Number(totalResult[0].total);

    const results = filtrarEmpresa
      ? await this.prisma.$queryRaw<any[]>`
                SELECT 
                    gc.id_solicitud, gc.fecha_solicitud, gc.area, gc.sede, gc.usu_solicita, 
                    gc.cargo_usu_solicita, gc.gerente_autoriza, gc.descri_prod, gc.caracteristicas, 
                    gc.proveedor, gc.area_cargar, gc.urgencia, gc.fecha_tentativa, gc.estado, 
                    gc.fecha_autorizacion, gc.cotizacion_file, gc.estado_autorizacion, gc.con_factura, gc.id_empresa,
                    us.nombres as usuario_reg, us.nit as nit_usu_reg,
                    ga.nombres as gerente, ga.nit as nit_gerente,
                    DATEDIFF(DAY, CONVERT(DATE, gc.fecha_solicitud), CONVERT(DATE, GETDATE())) as dias_gest
                FROM postv_gestion_compras gc 
                INNER JOIN terceros us ON us.nit = gc.usu_solicita
                LEFT JOIN terceros ga ON ga.nit = gc.gerente_autoriza
                WHERE ${whereClause}
                ORDER BY gc.estado_autorizacion ASC, gc.fecha_solicitud DESC, gc.id_solicitud DESC
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
            `
      : await this.prisma.$queryRaw<any[]>`
                SELECT 
                    gc.id_solicitud, gc.fecha_solicitud, gc.area, gc.sede, gc.usu_solicita, 
                    gc.cargo_usu_solicita, gc.gerente_autoriza, gc.descri_prod, gc.caracteristicas, 
                    gc.proveedor, gc.area_cargar, gc.urgencia, gc.fecha_tentativa, gc.estado, 
                    gc.fecha_autorizacion, gc.cotizacion_file, gc.estado_autorizacion, gc.con_factura,
                    us.nombres as usuario_reg, us.nit as nit_usu_reg,
                    ga.nombres as gerente, ga.nit as nit_gerente,
                    DATEDIFF(DAY, CONVERT(DATE, gc.fecha_solicitud), CONVERT(DATE, GETDATE())) as dias_gest
                FROM postv_gestion_compras gc 
                INNER JOIN terceros us ON us.nit = gc.usu_solicita
                LEFT JOIN terceros ga ON ga.nit = gc.gerente_autoriza
                WHERE ${whereClause}
                ORDER BY gc.estado_autorizacion ASC, gc.fecha_solicitud DESC, gc.id_solicitud DESC
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
            `;

    return {
      items: results.map((r) => ({
        ...this.mapToEntity(r),
        usuario_reg: r.usuario_reg || undefined,
        nit_usu_reg: r.nit_usu_reg ? Number(r.nit_usu_reg) : undefined,
        gerente: r.gerente || undefined,
        nit_gerente: r.nit_gerente ? Number(r.nit_gerente) : undefined,
        dias_gest: r.dias_gest ? Number(r.dias_gest) : undefined,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Usuarios.php getAllUsers: todos los de intranet (sin paginar, LEFT JOIN perfiles).
   * El filtro `estado = 1` está comentado en el legado.
   */
  async listarUsuariosComboGerente(): Promise<UsuarioGerenteCombo[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id_usuario: number;
        nom_perfil: string | null;
        nombres: string;
        usuario: string | null;
        nit: string;
        estado: number | null;
      }>
    >`
      SELECT
        u.id_usuario,
        p.nom_perfil,
        t.nombres,
        u.usuario,
        CAST(t.nit AS VARCHAR(20)) AS nit,
        u.estado
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      LEFT JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
      ORDER BY t.nombres ASC
    `;
    return rows.map((row) => ({
      nit: String(row.nit ?? ''),
      nombres: row.nombres ?? '',
    }));
  }

  async findById(id: bigint): Promise<GestionCompraEntity | null> {
    try {
      // Optimizado: Usar $queryRaw con parámetro seguro
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_solicitud, fecha_solicitud, area, sede, usu_solicita, 
                    cargo_usu_solicita, gerente_autoriza, descri_prod, caracteristicas, 
                    proveedor, area_cargar, urgencia, fecha_tentativa, estado, 
                    fecha_autorizacion, cotizacion_file, estado_autorizacion, con_factura, id_empresa
                FROM postv_gestion_compras
                WHERE id_solicitud = ${id}
            `;

      if (!result || result.length === 0) return null;

      return this.mapToEntity(result[0]);
    } catch (error) {
      console.error('Error buscando compra:', error);
      return null;
    }
  }

  async cambiarEstado(
    id: bigint,
    estado: number,
    estadoAutorizacion?: number,
  ): Promise<boolean> {
    try {
      const idNum = Number(id);
      if (estadoAutorizacion !== undefined && estadoAutorizacion !== null) {
        const count = await this.prisma.$executeRaw`
                    UPDATE postv_gestion_compras
                    SET estado = ${estado}, estado_autorizacion = ${estadoAutorizacion}
                    WHERE id_solicitud = ${idNum}
                `;
        return Number(count) > 0;
      }
      const count = await this.prisma.$executeRaw`
                UPDATE postv_gestion_compras
                SET estado = ${estado}
                WHERE id_solicitud = ${idNum}
            `;
      return Number(count) > 0;
    } catch (error) {
      console.error('Error cambiando estado:', error);
      return false;
    }
  }

  async marcarConFactura(id: bigint, conFactura: string): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
                UPDATE postv_gestion_compras
                SET con_factura = ${conFactura}
                WHERE id_solicitud = ${id}
            `;
      return true;
    } catch (error) {
      console.error('Error marcando con factura:', error);
      return false;
    }
  }

  async crearMensaje(
    solicitudId: bigint,
    nitUsuario: number,
    mensaje: string,
  ): Promise<bigint | null> {
    try {
      const fecha = new Date().toISOString();
      const rows = await this.prisma.$queryRaw<Array<{ id_msn: bigint }>>`
                INSERT INTO postv_msn_gestion_compras 
                (nit_usu, mensaje, fecha, solicitud_compra)
                OUTPUT INSERTED.id_msn
                VALUES 
                (${nitUsuario}, ${mensaje}, ${fecha}, ${solicitudId})
            `;
      const id = rows[0]?.id_msn;
      return id != null ? BigInt(id) : null;
    } catch (error) {
      console.error('Error creando mensaje:', error);
      return null;
    }
  }

  async listarMensajes(solicitudId: bigint): Promise<MensajeCompra[]> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    mgc.id_msn AS id_mensaje, mgc.nit_usu, mgc.mensaje, mgc.fecha, mgc.solicitud_compra,
                    t.nombres
                FROM postv_msn_gestion_compras mgc
                INNER JOIN terceros t ON t.nit = mgc.nit_usu
                WHERE mgc.solicitud_compra = ${solicitudId}
                ORDER BY mgc.id_msn DESC
            `;
      return results.map((r) => ({
        id_mensaje: BigInt(r.id_mensaje),
        nit_usu: Number(r.nit_usu),
        nombres: r.nombres,
        mensaje: r.mensaje,
        fecha: new Date(r.fecha),
        solicitud_compra: BigInt(r.solicitud_compra),
      }));
    } catch (error) {
      console.error('Error listando mensajes:', error);
      return [];
    }
  }

  async listarMensajesExcel(
    solicitudIds: bigint[],
  ): Promise<MensajeExcelCompra[]> {
    if (solicitudIds.length === 0) return [];
    const rows = await this.prisma.$queryRaw<
      Array<{
        solicitud_compra: bigint;
        nombres: string;
        mensaje: string;
      }>
    >`
      SELECT mgc.solicitud_compra, t.nombres, mgc.mensaje
      FROM postv_msn_gestion_compras mgc
      INNER JOIN terceros t ON t.nit = mgc.nit_usu
      WHERE mgc.solicitud_compra IN (${Prisma.join(solicitudIds)})
      ORDER BY mgc.id_msn DESC
    `;
    return rows.map((row) => ({
      solicitud_compra: BigInt(row.solicitud_compra),
      nombres: row.nombres ?? '',
      mensaje: row.mensaje ?? '',
    }));
  }

  async enviarAutorizacion(
    solicitudId: bigint,
    _comentarios: string,
    archivos: string[],
  ): Promise<bigint[] | null> {
    try {
      await this.prisma.$executeRaw`
                UPDATE postv_gestion_compras
                SET estado_autorizacion = 2, estado = 2
                WHERE id_solicitud = ${solicitudId}
            `;

      const ids: bigint[] = [];
      for (const archivo of archivos) {
        const inserted = await this.prisma.$queryRaw<
          Array<{ id_coti: bigint }>
        >`
                        INSERT INTO postv_cotizaciones_gest_compras 
                        (id_compra, url, estado)
                        OUTPUT INSERTED.id_coti
                        VALUES 
                        (${solicitudId}, ${archivo}, 0)
                    `;
        if (inserted[0]?.id_coti != null) {
          ids.push(BigInt(inserted[0].id_coti));
        }
      }

      return ids;
    } catch (error) {
      console.error('Error enviando autorización:', error);
      return null;
    }
  }

  async insertarLog(data: {
    idSolicitud: bigint;
    usuarioReg: number;
    item: number;
    idCotizacion?: bigint | null;
    idMensaje?: bigint | null;
  }): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO postv_gestion_compras_log
        (usuario_reg, item, id_solicitud, id_cotizacion, id_mensaje)
      VALUES (
        ${data.usuarioReg},
        ${data.item},
        ${data.idSolicitud},
        ${data.idCotizacion ?? null},
        ${data.idMensaje ?? null}
      )
    `;
  }

  async obtenerCotizacion(
    idCoti: bigint,
  ): Promise<CotizacionGestCompra | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id_coti: bigint;
        id_compra: bigint;
        url: string;
        estado: number;
      }>
    >`
      SELECT id_coti, id_compra, url, estado
      FROM postv_cotizaciones_gest_compras
      WHERE id_coti = ${idCoti}
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id_coti: BigInt(row.id_coti),
      id_compra: BigInt(row.id_compra),
      url: row.url,
      estado: Number(row.estado),
    };
  }

  async obtenerUrlCotizacionAprobada(idCompra: bigint): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<{ url: string | null }>>`
      SELECT url
      FROM postv_cotizaciones_gest_compras
      WHERE id_compra = ${idCompra} AND estado = 1
    `;
    const url = rows[0]?.url?.trim();
    return url ? url : null;
  }

  async nombreTercero(nit: number): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<{ nombres: string | null }>>`
      SELECT nombres FROM terceros WHERE nit = ${nit}
    `;
    const nombre = rows[0]?.nombres?.trim();
    return nombre ? nombre : null;
  }

  async marcarCotizacionEstado(idCoti: bigint, estado: number): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE postv_cotizaciones_gest_compras
      SET estado = ${estado}
      WHERE id_coti = ${idCoti}
    `;
  }

  async rechazarCotizacionesPendientes(idCompra: bigint): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE postv_cotizaciones_gest_compras
      SET estado = 2
      WHERE id_compra = ${idCompra} AND estado NOT IN (1, 2)
    `;
  }

  async guardarResultadoAutorizacion(
    idSolicitud: bigint,
    estadoAutorizacion: number,
    fecha: string,
    cotizacionFile?: string | null,
  ): Promise<boolean> {
    if (cotizacionFile != null) {
      const count = await this.prisma.$executeRaw`
        UPDATE postv_gestion_compras
        SET estado_autorizacion = ${estadoAutorizacion},
            fecha_autorizacion = ${fecha},
            cotizacion_file = ${cotizacionFile}
        WHERE id_solicitud = ${idSolicitud}
      `;
      return Number(count) > 0;
    }
    const count = await this.prisma.$executeRaw`
      UPDATE postv_gestion_compras
      SET estado_autorizacion = ${estadoAutorizacion},
          fecha_autorizacion = ${fecha}
      WHERE id_solicitud = ${idSolicitud}
    `;
    return Number(count) > 0;
  }

  private mapToEntity(data: any): GestionCompraEntity {
    return new GestionCompraEntity({
      id_solicitud: BigInt(data.id_solicitud),
      fecha_solicitud: new Date(data.fecha_solicitud),
      area: data.area,
      sede: data.sede,
      usu_solicita: Number(data.usu_solicita),
      cargo_usu_solicita: data.cargo_usu_solicita,
      gerente_autoriza: Number(data.gerente_autoriza),
      descri_prod: data.descri_prod,
      caracteristicas: data.caracteristicas,
      proveedor: data.proveedor,
      area_cargar: data.area_cargar,
      urgencia: Number(data.urgencia),
      fecha_tentativa: new Date(data.fecha_tentativa),
      estado: Number(data.estado),
      fecha_autorizacion: data.fecha_autorizacion
        ? new Date(data.fecha_autorizacion)
        : null,
      cotizacion_file: data.cotizacion_file,
      estado_autorizacion: Number(data.estado_autorizacion),
      con_factura: data.con_factura,
      id_empresa: data.id_empresa != null ? Number(data.id_empresa) : null,
    });
  }
}
