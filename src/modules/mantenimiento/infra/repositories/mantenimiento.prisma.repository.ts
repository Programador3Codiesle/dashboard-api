import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  IMantenimientoRepository,
  type BodegaMto,
  type DatosHidraulicos,
  type DatosTecnicos,
  type EquipoRow,
  type FamiliaOption,
  type JefeOption,
  type ListaItem,
  type NombreEquipoOption,
  type PersonalMto,
} from '../../domain/mantenimiento.repository';
import { BODEGAS_MTO_IDS } from '../../domain/mantenimiento.constants';

function asStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    const maybe = v as { toString?: () => unknown };
    if (typeof maybe.toString === 'function') {
      const s = maybe.toString();
      if (typeof s === 'string' && s !== '' && s !== '[object Object]') {
        return s;
      }
    }
  }
  return '';
}

function likeContains(term: string): string {
  const escaped = term.replace(/[[\]%_]/g, (ch) => `[${ch}]`);
  return `%${escaped}%`;
}

function num(v: unknown): number {
  return v == null || v === '' ? 0 : Number(v);
}

@Injectable()
export class MantenimientoPrismaRepository implements IMantenimientoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarEquipos(
    filters: { filter?: string; bodega?: string; area?: string },
    limit: number,
    offset: number,
  ): Promise<EquipoRow[]> {
    const where = this.equiposWhere(filters);
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT e.id_equipo, e.nombre_equipo, e.bodega, e.codigo, e.estado,
               e.area, e.cv_equipo, e.alias_equipo, e.imagen_equipo
        FROM dbo.postv_equipos e
        ${where}
        ORDER BY e.id_equipo DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `,
    );
    return rows.map(this.mapEquipo);
  }

  async countEquipos(filters: {
    filter?: string;
    bodega?: string;
    area?: string;
  }): Promise<number> {
    const where = this.equiposWhere(filters);
    const rows = await this.prisma.$queryRaw<Array<{ c: number }>>(
      Prisma.sql`SELECT COUNT(*) AS c FROM dbo.postv_equipos e ${where}`,
    );
    return num(rows[0]?.c);
  }

  private equiposWhere(filters: {
    filter?: string;
    bodega?: string;
    area?: string;
  }): Prisma.Sql {
    const parts: Prisma.Sql[] = [];
    if (filters.filter) {
      const f = likeContains(filters.filter);
      parts.push(Prisma.sql`(e.nombre_equipo LIKE ${f} OR e.codigo LIKE ${f})`);
    }
    if (filters.bodega) {
      parts.push(Prisma.sql`e.bodega = ${filters.bodega}`);
    }
    if (filters.area) {
      parts.push(Prisma.sql`e.area = ${filters.area}`);
    }
    if (parts.length === 0) return Prisma.empty;
    return Prisma.sql`WHERE ${Prisma.join(parts, ' AND ')}`;
  }

  private nullable = (v: unknown): string | null =>
    v == null || v === '' ? null : asStr(v);

  private mapEquipo = (r: Record<string, unknown>): EquipoRow => ({
    id_equipo: num(r.id_equipo),
    nombre_equipo: asStr(r.nombre_equipo),
    bodega: asStr(r.bodega),
    codigo: asStr(r.codigo),
    estado: asStr(r.estado),
    area: asStr(r.area),
    cv_equipo: this.nullable(r.cv_equipo),
    alias_equipo: this.nullable(r.alias_equipo),
    imagen_equipo: this.nullable(r.imagen_equipo),
    fabricante: this.nullable(r.fabricante),
    modelo: this.nullable(r.modelo),
    marca: this.nullable(r.marca),
    ubicacion: this.nullable(r.ubicacion),
    sector: this.nullable(r.sector),
    descripcion: this.nullable(r.descripcion),
    periodo_mtto_preventivo: this.nullable(r.periodo_mtto_preventivo),
    dist_nombre: this.nullable(r.dist_nombre),
    dist_direccion: this.nullable(r.dist_direccion),
    dist_telefono: this.nullable(r.dist_telefono),
    dist_ciudad: this.nullable(r.dist_ciudad),
    dist_departamento: this.nullable(r.dist_departamento),
    dist_redes_sociales: this.nullable(r.dist_redes_sociales),
  });

  async getEquipoById(id: number): Promise<EquipoRow | null> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`SELECT * FROM dbo.postv_equipos WHERE id_equipo = ${id}`,
    );
    return rows[0] ? this.mapEquipo(rows[0]) : null;
  }

  async getFamilias(): Promise<FamiliaOption[]> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`SELECT codigo, nombre FROM dbo.postv_equipos_familia ORDER BY nombre`,
    );
    return rows.map((r) => ({
      codigo: asStr(r.codigo),
      nombre: asStr(r.nombre),
    }));
  }

  async getNombresFamilia(codigoF: string): Promise<NombreEquipoOption[]> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT codigo_equipo, nombre_equipo, codigo_f
        FROM dbo.postv_equipos_familia_nombres
        WHERE codigo_f = ${codigoF}
      `,
    );
    return rows.map((r) => ({
      codigo_equipo: asStr(r.codigo_equipo),
      nombre_equipo: asStr(r.nombre_equipo),
      codigo_f: asStr(r.codigo_f),
    }));
  }

  async getNombreEquipo(
    codigoF: string,
    codigoN: string,
  ): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT TOP 1 nombre_equipo
        FROM dbo.postv_equipos_familia_nombres
        WHERE codigo_f = ${codigoF} AND codigo_equipo = ${codigoN}
      `,
    );
    return rows[0] ? asStr(rows[0].nombre_equipo) : null;
  }

  async ultimoCodigoLike(prefijo: string): Promise<string | null> {
    const like = `%${prefijo}%`;
    const rows = await this.prisma.$queryRaw<Array<{ codigo: string }>>(
      Prisma.sql`
        SELECT TOP (1) codigo
        FROM postv_equipos
        WHERE codigo LIKE ${like}
        ORDER BY codigo DESC
      `,
    );
    return rows[0]?.codigo != null ? asStr(rows[0].codigo) : null;
  }

  async insertEquipo(data: {
    nombre: string;
    bodega: string;
    codigo: string;
    estado: string;
    area: string;
    cv: string | null;
    alias: string;
    fabricante?: string | null;
    modelo?: string | null;
    marca?: string | null;
    ubicacion?: string | null;
    sector?: string | null;
    descripcion?: string | null;
    periodo_mtto_preventivo?: string | null;
    imagen?: string | null;
    dist_nombre?: string | null;
    dist_direccion?: string | null;
    dist_telefono?: string | null;
    dist_ciudad?: string | null;
    dist_departamento?: string | null;
    dist_redes_sociales?: string | null;
  }): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ id_equipo: number }>>`
      INSERT INTO dbo.postv_equipos
        (nombre_equipo, bodega, codigo, estado, area, cv_equipo, alias_equipo,
         fabricante, modelo, marca, ubicacion, sector, descripcion,
         periodo_mtto_preventivo, imagen_equipo,
         dist_nombre, dist_direccion, dist_telefono, dist_ciudad,
         dist_departamento, dist_redes_sociales)
      OUTPUT INSERTED.id_equipo
      VALUES
        (${data.nombre}, ${data.bodega}, ${data.codigo}, ${data.estado},
         ${data.area}, ${data.cv}, ${data.alias},
         ${data.fabricante ?? null}, ${data.modelo ?? null}, ${data.marca ?? null},
         ${data.ubicacion ?? null}, ${data.sector ?? null}, ${data.descripcion ?? null},
         ${data.periodo_mtto_preventivo ?? null}, ${data.imagen ?? null},
         ${data.dist_nombre ?? null}, ${data.dist_direccion ?? null},
         ${data.dist_telefono ?? null}, ${data.dist_ciudad ?? null},
         ${data.dist_departamento ?? null}, ${data.dist_redes_sociales ?? null})
    `;
    return num(rows[0]?.id_equipo);
  }

  async updateEquipo(
    id: number,
    data: {
      nombre: string;
      bodega: string;
      codigo: string;
      estado: string;
      area: string;
      alias: string;
      cv?: string;
      fabricante?: string | null;
      modelo?: string | null;
      marca?: string | null;
      ubicacion?: string | null;
      sector?: string | null;
      descripcion?: string | null;
      periodo_mtto_preventivo?: string | null;
      imagen?: string | null;
      dist_nombre?: string | null;
      dist_direccion?: string | null;
      dist_telefono?: string | null;
      dist_ciudad?: string | null;
      dist_departamento?: string | null;
      dist_redes_sociales?: string | null;
    },
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_equipos
      SET nombre_equipo = ${data.nombre},
          bodega = ${data.bodega},
          codigo = ${data.codigo},
          estado = ${data.estado},
          area = ${data.area},
          alias_equipo = ${data.alias},
          cv_equipo = COALESCE(${data.cv ?? null}, cv_equipo),
          fabricante = ${data.fabricante ?? null},
          modelo = ${data.modelo ?? null},
          marca = ${data.marca ?? null},
          ubicacion = ${data.ubicacion ?? null},
          sector = ${data.sector ?? null},
          descripcion = ${data.descripcion ?? null},
          periodo_mtto_preventivo = ${data.periodo_mtto_preventivo ?? null},
          imagen_equipo = COALESCE(${data.imagen ?? null}, imagen_equipo),
          dist_nombre = ${data.dist_nombre ?? null},
          dist_direccion = ${data.dist_direccion ?? null},
          dist_telefono = ${data.dist_telefono ?? null},
          dist_ciudad = ${data.dist_ciudad ?? null},
          dist_departamento = ${data.dist_departamento ?? null},
          dist_redes_sociales = ${data.dist_redes_sociales ?? null}
      WHERE id_equipo = ${id}
    `;
  }

  async updateEstadoEquipo(id: number, estado: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_equipos SET estado = ${estado} WHERE id_equipo = ${id}
    `;
  }

  async updatePeriodoEquipo(id: number, periodo: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_equipos
      SET periodo_mtto_preventivo = ${periodo}
      WHERE id_equipo = ${id}
    `;
  }

  async upsertDatosTecnicos(
    idEquipo: number,
    data: DatosTecnicos,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM dbo.postv_equipos_datos_tecnicos WHERE id_equipo = ${idEquipo}
    `;
    await this.prisma.$executeRaw`
      INSERT INTO dbo.postv_equipos_datos_tecnicos
        (id_equipo, alimentacion, frecuencia_alimentacion, anio_fabricacion,
         numero_serie, potencia_consumo, peso, revolucion)
      VALUES
        (${idEquipo}, ${data.alimentacion}, ${data.frecuencia_alimentacion},
         ${data.anio_fabricacion}, ${data.numero_serie}, ${data.potencia_consumo},
         ${data.peso}, ${data.revolucion})
    `;
  }

  async deleteDatosTecnicos(idEquipo: number): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM dbo.postv_equipos_datos_tecnicos WHERE id_equipo = ${idEquipo}
    `;
  }

  async upsertDatosHidraulicos(
    idEquipo: number,
    data: DatosHidraulicos,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM dbo.postv_equipos_datos_hidraulicos WHERE id_equipo = ${idEquipo}
    `;
    await this.prisma.$executeRaw`
      INSERT INTO dbo.postv_equipos_datos_hidraulicos
        (id_equipo, capacidad_litros, capacidad_carga_tn, tipo_aceite,
         capacidad_maxima_carga)
      VALUES
        (${idEquipo}, ${data.capacidad_litros}, ${data.capacidad_carga_tn},
         ${data.tipo_aceite}, ${data.capacidad_maxima_carga})
    `;
  }

  async deleteDatosHidraulicos(idEquipo: number): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM dbo.postv_equipos_datos_hidraulicos WHERE id_equipo = ${idEquipo}
    `;
  }

  async replaceLista(
    tabla: 'elementos' | 'recomendaciones' | 'mtto_operativo',
    idEquipo: number,
    items: string[],
  ): Promise<void> {
    if (tabla === 'elementos') {
      await this.prisma.$executeRaw`
        DELETE FROM dbo.postv_equipos_elementos WHERE id_equipo = ${idEquipo}
      `;
    } else if (tabla === 'recomendaciones') {
      await this.prisma.$executeRaw`
        DELETE FROM dbo.postv_equipos_recomendaciones WHERE id_equipo = ${idEquipo}
      `;
    } else {
      await this.prisma.$executeRaw`
        DELETE FROM dbo.postv_equipos_mtto_operativo WHERE id_equipo = ${idEquipo}
      `;
    }
    let orden = 1;
    for (const texto of items) {
      const clean = texto.trim();
      if (!clean) continue;
      if (tabla === 'elementos') {
        await this.prisma.$executeRaw`
          INSERT INTO dbo.postv_equipos_elementos (id_equipo, orden, texto)
          VALUES (${idEquipo}, ${orden}, ${clean})
        `;
      } else if (tabla === 'recomendaciones') {
        await this.prisma.$executeRaw`
          INSERT INTO dbo.postv_equipos_recomendaciones (id_equipo, orden, texto)
          VALUES (${idEquipo}, ${orden}, ${clean})
        `;
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO dbo.postv_equipos_mtto_operativo (id_equipo, orden, texto)
          VALUES (${idEquipo}, ${orden}, ${clean})
        `;
      }
      orden += 1;
    }
  }

  async getDatosTecnicos(idEquipo: number): Promise<DatosTecnicos | null> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT alimentacion, frecuencia_alimentacion, anio_fabricacion,
             numero_serie, potencia_consumo, peso, revolucion
      FROM dbo.postv_equipos_datos_tecnicos
      WHERE id_equipo = ${idEquipo}
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      alimentacion: this.nullable(r.alimentacion),
      frecuencia_alimentacion: this.nullable(r.frecuencia_alimentacion),
      anio_fabricacion: this.nullable(r.anio_fabricacion),
      numero_serie: this.nullable(r.numero_serie),
      potencia_consumo: this.nullable(r.potencia_consumo),
      peso: this.nullable(r.peso),
      revolucion: this.nullable(r.revolucion),
    };
  }

  async getDatosHidraulicos(
    idEquipo: number,
  ): Promise<DatosHidraulicos | null> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT capacidad_litros, capacidad_carga_tn, tipo_aceite,
             capacidad_maxima_carga
      FROM dbo.postv_equipos_datos_hidraulicos
      WHERE id_equipo = ${idEquipo}
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      capacidad_litros: this.nullable(r.capacidad_litros),
      capacidad_carga_tn: this.nullable(r.capacidad_carga_tn),
      tipo_aceite: this.nullable(r.tipo_aceite),
      capacidad_maxima_carga: this.nullable(r.capacidad_maxima_carga),
    };
  }

  async getLista(
    tabla: 'elementos' | 'recomendaciones' | 'mtto_operativo',
    idEquipo: number,
  ): Promise<ListaItem[]> {
    let rows: Array<Record<string, unknown>>;
    if (tabla === 'elementos') {
      rows = await this.prisma.$queryRaw`
        SELECT orden, texto FROM dbo.postv_equipos_elementos
        WHERE id_equipo = ${idEquipo} ORDER BY orden ASC
      `;
    } else if (tabla === 'recomendaciones') {
      rows = await this.prisma.$queryRaw`
        SELECT orden, texto FROM dbo.postv_equipos_recomendaciones
        WHERE id_equipo = ${idEquipo} ORDER BY orden ASC
      `;
    } else {
      rows = await this.prisma.$queryRaw`
        SELECT orden, texto FROM dbo.postv_equipos_mtto_operativo
        WHERE id_equipo = ${idEquipo} ORDER BY orden ASC
      `;
    }
    return rows.map((r) => ({ orden: num(r.orden), texto: asStr(r.texto) }));
  }

  async listarJefes(): Promise<JefeOption[]> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT tj.nombres, tj.nit, jf.correo
        FROM postv_jefes jf
        INNER JOIN terceros tj ON tj.nit = jf.nit_jefe
        INNER JOIN w_sist_usuarios uj ON uj.nit_usuario = jf.nit_jefe
      `,
    );
    return rows.map((r) => ({
      nit: asStr(r.nit),
      nombres: asStr(r.nombres),
      correo: r.correo != null ? asStr(r.correo) : null,
    }));
  }

  async listarPersonalMto(): Promise<PersonalMto[]> {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT u.id_usuario, t.nombres, t.nit
        FROM w_sist_usuarios u
        INNER JOIN terceros t ON t.nit = u.nit_usuario
        INNER JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
        WHERE p.id_perfil = 46
      `,
    );
    return rows.map((r) => ({
      id_usuario: num(r.id_usuario),
      nombres: asStr(r.nombres),
      nit: asStr(r.nit),
    }));
  }

  async listarBodegasMto(): Promise<BodegaMto[]> {
    const ids = [...BODEGAS_MTO_IDS];
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT bodega, descripcion FROM bodegas
        WHERE bodega IN (${Prisma.join(ids)})
      `,
    );
    return rows.map((r) => ({
      bodega: num(r.bodega),
      descripcion: asStr(r.descripcion),
    }));
  }

  async listarEquiposActivos() {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT id_equipo, codigo, nombre_equipo
        FROM dbo.postv_equipos
        WHERE estado != 'inactivo'
        ORDER BY id_equipo DESC
      `,
    );
    return rows.map((r) => ({
      id_equipo: num(r.id_equipo),
      codigo: asStr(r.codigo),
      nombre_equipo: asStr(r.nombre_equipo),
    }));
  }

  async historialPreventivo(codigo: string) {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT e.id_equipo, e.nombre_equipo, e.codigo, e.estado,
             tm.asignado, tm.fecha_solicitud, tm.fecha_requerida, tm.fecha_final,
             tm.fecha_inicio, tm.descripcion AS descrip, tm.observaciones,
             tm.detalle_piezas, tm.id_mantenimientos,
             tp.tipo_mantenimiento, tp.id_mantenimiento,
             tm.estado AS estadoMto, t.nombres AS NameAsignado
      FROM dbo.postv_mantenimientos tm
      LEFT JOIN dbo.postv_equipos e ON tm.codigo_equipo = e.codigo
      LEFT JOIN dbo.postv_tipo_mantenimiento tp
        ON tp.id_mantenimiento = tm.id_tipo_mantenimiento
      LEFT JOIN terceros t ON t.nit = tm.asignado
      WHERE tm.codigo_equipo = ${codigo}
      ORDER BY fecha_solicitud DESC, fecha_requerida DESC,
               fecha_inicio DESC, fecha_final DESC
    `);
  }

  async historialCorrectivo(idEquipo: number) {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT tj.nombres AS nombreJ, te.nombres AS nombreE,
             eq.codigo, eq.nombre_equipo, sm.*
      FROM postv_solicitud_mantenimiento sm
      INNER JOIN terceros tj ON tj.nit = sm.jefe
      LEFT JOIN terceros te ON te.nit = sm.encargado
      INNER JOIN w_sist_usuarios uj ON uj.nit_usuario = sm.jefe
      LEFT JOIN w_sist_usuarios ue ON ue.nit_usuario = sm.encargado
      LEFT JOIN postv_equipos eq ON eq.id_equipo = sm.id_equipo
      WHERE sm.id_equipo = ${idEquipo}
      ORDER BY fecha_solicitud DESC, fecha_inicio DESC, fecha_finalizacion DESC
    `);
  }

  async detallePreventivo(id: number) {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`SELECT * FROM dbo.postv_mantenimientos WHERE id_mantenimientos = ${id}`,
    );
    return rows[0] ?? null;
  }

  async insertRetiro(data: {
    equipoId: number;
    nitSolicita: string;
    motivo: string;
    imagen: string;
    fecha: string;
  }): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      INSERT INTO postv_equipos_retirados
        (equipo_id, nit_usuario_solicita, motivo, imagen, estado, fecha_solicitud)
      OUTPUT INSERTED.id
      VALUES
        (${data.equipoId}, ${data.nitSolicita}, ${data.motivo},
         ${data.imagen}, 0, ${data.fecha})
    `);
    return num(rows[0]?.id);
  }

  async getRetiroById(id: number) {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT id, equipo_id, estado FROM postv_equipos_retirados WHERE id = ${id}
      `,
    );
    if (!rows[0]) return null;
    return {
      id: num(rows[0].id),
      equipo_id: num(rows[0].equipo_id),
      estado: num(rows[0].estado),
    };
  }

  async autorizarRetiro(id: number, nitJefe: string, fecha: string) {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_equipos_retirados
      SET nit_usuario_autoriza = ${nitJefe}, estado = 2, fecha_autoriza = ${fecha}
      WHERE id = ${id}
    `;
  }

  async rechazarRetiro(id: number, nitJefe: string, fecha: string) {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_equipos_retirados
      SET nit_usuario_autoriza = ${nitJefe}, estado = 1, fecha_autoriza = ${fecha}
      WHERE id = ${id}
    `;
  }

  async getSedesUsuario(nit: string): Promise<number[]> {
    const rows = await this.prisma.$queryRaw<Array<{ idsede: number }>>(
      Prisma.sql`
        SELECT usede.idsede
        FROM sw_usuariosede usede
        INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
        INNER JOIN terceros t ON t.nit_real = su.nit_usuario
        WHERE nit_real = ${nit}
      `,
    );
    return rows.map((r) => num(r.idsede));
  }

  private solicitudSelect = Prisma.sql`
    SELECT tj.nombres AS nombreJ, te.nombres AS nombreE, eq.codigo, eq.nombre_equipo,
           sm.*,
           dias_gest = DATEDIFF(DAY, CONVERT(DATE, sm.fecha_solicitud), CONVERT(DATE, GETDATE()))
    FROM postv_solicitud_mantenimiento sm
    INNER JOIN terceros tj ON tj.nit = sm.jefe
    LEFT JOIN terceros te ON te.nit = sm.encargado
    INNER JOIN w_sist_usuarios uj ON uj.nit_usuario = sm.jefe
    LEFT JOIN w_sist_usuarios ue ON ue.nit_usuario = sm.encargado
    LEFT JOIN dbo.postv_equipos eq ON eq.id_equipo = sm.id_equipo
  `;

  async listarSolicitudesJefe(nit: string) {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      ${this.solicitudSelect}
      WHERE sm.jefe = ${nit}
      ORDER BY sm.estado ASC
    `);
  }

  async listarSolicitudesSedes(sedes: number[]) {
    if (sedes.length === 0) return [];
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      ${this.solicitudSelect}
      WHERE sm.sede IN (${Prisma.join(sedes)})
      ORDER BY sm.estado ASC
    `);
  }

  async listarSolicitudesAdmins() {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      ${this.solicitudSelect}
      ORDER BY sm.estado ASC
    `);
  }

  async getSolicitudById(id: number) {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        ${this.solicitudSelect}
        WHERE sm.id_solicitud = ${id}
      `,
    );
    return rows[0] ?? null;
  }

  async insertSolicitud(data: {
    jefe: string;
    fecha: string;
    solicitud: string;
    urgencia: number;
    sede: number;
    imagen: string | null;
    idEquipo: number | null;
  }) {
    if (data.idEquipo != null) {
      await this.prisma.$executeRaw`
        INSERT INTO postv_solicitud_mantenimiento
          (jefe, fecha_solicitud, solicitud, estado, urgencia, sede, imagen, id_equipo)
        VALUES
          (${data.jefe}, ${data.fecha}, ${data.solicitud}, 1, ${data.urgencia},
           ${data.sede}, ${data.imagen}, ${data.idEquipo})
      `;
    } else {
      await this.prisma.$executeRaw`
        INSERT INTO postv_solicitud_mantenimiento
          (jefe, fecha_solicitud, solicitud, estado, urgencia, sede, imagen)
        VALUES
          (${data.jefe}, ${data.fecha}, ${data.solicitud}, 1, ${data.urgencia},
           ${data.sede}, ${data.imagen})
      `;
    }
  }

  async iniciarSolicitud(
    id: number,
    encargado: string,
    fechaInicio: string,
    tiempoEstimado: number,
  ) {
    await this.prisma.$executeRaw`
      UPDATE postv_solicitud_mantenimiento
      SET encargado = ${encargado}, fecha_inicio = ${fechaInicio},
          estado = 2, tiempo_estimado = ${tiempoEstimado}
      WHERE id_solicitud = ${id}
    `;
  }

  async finalizarSolicitud(
    id: number,
    respuesta: string,
    fechaFinal: string,
    imagenResp: string | null,
  ) {
    await this.prisma.$executeRaw`
      UPDATE postv_solicitud_mantenimiento
      SET respuesta = ${respuesta}, fecha_finalizacion = ${fechaFinal},
          estado = 3, imagen_respuesta = ${imagenResp}
      WHERE id_solicitud = ${id}
    `;
  }

  async updateEquipoSolicitud(idSolicitud: number, idEquipo: number) {
    await this.prisma.$executeRaw`
      UPDATE postv_solicitud_mantenimiento
      SET id_equipo = ${idEquipo}
      WHERE id_solicitud = ${idSolicitud}
    `;
  }

  async listarMensajes(idSolicitud: number) {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT mensaje, emisor, id_solicitud, nombre_emisor
        FROM postv_solicitud_mantenimiento_respuestas
        WHERE id_solicitud = ${idSolicitud}
      `,
    );
    return rows.map((r) => ({
      mensaje: asStr(r.mensaje),
      emisor: asStr(r.emisor),
      id_solicitud: num(r.id_solicitud),
      nombre_emisor: asStr(r.nombre_emisor),
    }));
  }

  async insertMensaje(data: {
    mensaje: string;
    emisor: string;
    idSolicitud: number;
    nombreEmisor: string;
  }) {
    await this.prisma.$executeRaw`
      INSERT INTO postv_solicitud_mantenimiento_respuestas
        (mensaje, emisor, id_solicitud, nombre_emisor)
      VALUES
        (${data.mensaje}, ${data.emisor}, ${data.idSolicitud}, ${data.nombreEmisor})
    `;
  }

  private cronogramaWhere(sedes?: string[]): Prisma.Sql {
    if (!sedes?.length) return Prisma.empty;
    return Prisma.sql`WHERE equi.bodega IN (${Prisma.join(sedes)})`;
  }

  async cronograma(sedes?: string[]) {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT mto.id_mantenimientos, equi.codigo, equi.nombre_equipo, equi.area, equi.bodega,
             mto.responsable, mto.asignado, mto.fecha_solicitud,
             mto.fecha_requerida, mto.fecha_inicio, mto.fecha_final,
             mto.descripcion, mto.observaciones, mto.detalle_piezas,
             mto.id_tipo_mantenimiento, tmto.tipo_mantenimiento, mto.estado
      FROM postv_mantenimientos AS mto
      INNER JOIN dbo.postv_equipos AS equi ON equi.codigo = mto.codigo_equipo
      INNER JOIN dbo.postv_tipo_mantenimiento AS tmto
        ON tmto.id_mantenimiento = mto.id_tipo_mantenimiento
      ${this.cronogramaWhere(sedes)}
    `);
  }

  async listadoPendientes(sedes?: string[]) {
    const extra = sedes?.length
      ? Prisma.sql`AND equi.bodega IN (${Prisma.join(sedes)})`
      : Prisma.empty;
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT mto.id_mantenimientos, equi.codigo, equi.nombre_equipo, equi.area, equi.bodega,
             mto.responsable, mto.asignado, mto.fecha_solicitud,
             mto.fecha_requerida, mto.fecha_inicio, mto.fecha_final,
             mto.descripcion, mto.observaciones, mto.detalle_piezas,
             mto.id_tipo_mantenimiento, tmto.tipo_mantenimiento, mto.estado
      FROM postv_mantenimientos AS mto
      INNER JOIN dbo.postv_equipos AS equi ON equi.codigo = mto.codigo_equipo
      INNER JOIN dbo.postv_tipo_mantenimiento AS tmto
        ON tmto.id_mantenimiento = mto.id_tipo_mantenimiento
      WHERE mto.estado = 1 ${extra}
      ORDER BY mto.fecha_requerida ASC
    `);
  }

  async ordenPreventivoById(id: number) {
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>(
      Prisma.sql`
        SELECT mto.id_mantenimientos, equi.codigo, equi.nombre_equipo, equi.area, equi.bodega,
               equi.periodo_mtto_preventivo,
               mto.responsable, mto.asignado, mto.fecha_solicitud,
               mto.fecha_requerida, mto.fecha_inicio, mto.fecha_final,
               mto.descripcion, mto.observaciones, mto.detalle_piezas,
               equi.id_equipo, mto.id_tipo_mantenimiento, tmto.tipo_mantenimiento,
               te.nombres AS nombre_asignado, tr.nombres AS nombre_responsable, mto.estado,
               mto.tiempo_estimado
        FROM postv_mantenimientos AS mto
        INNER JOIN dbo.postv_equipos AS equi ON equi.codigo = mto.codigo_equipo
        INNER JOIN dbo.postv_tipo_mantenimiento AS tmto
          ON tmto.id_mantenimiento = mto.id_tipo_mantenimiento
        LEFT JOIN terceros te ON te.nit = mto.asignado
        INNER JOIN terceros tr ON tr.nit = mto.responsable
        WHERE mto.id_mantenimientos = ${id}
      `,
    );
    return rows[0] ?? null;
  }

  async insertOrdenPreventiva(data: {
    codigo: string;
    responsable: string;
    fechaSolicitud: string;
    fechaRequerida: string;
    descripcion: string;
    tiempoEstimado: number;
  }) {
    await this.prisma.$executeRaw`
      INSERT INTO postv_mantenimientos
        (codigo_equipo, id_tipo_mantenimiento, responsable, fecha_solicitud,
         fecha_requerida, descripcion, estado, tiempo_estimado)
      VALUES
        (${data.codigo}, 1, ${data.responsable}, ${data.fechaSolicitud},
         ${data.fechaRequerida}, ${data.descripcion}, 1, ${data.tiempoEstimado})
    `;
  }

  async iniciarOrden(id: number, asignado: string, fechaInicio: string) {
    await this.prisma.$executeRaw`
      UPDATE postv_mantenimientos
      SET asignado = ${asignado}, fecha_inicio = ${fechaInicio}, estado = 2
      WHERE id_mantenimientos = ${id}
    `;
  }

  async finalizarOrden(
    id: number,
    observaciones: string,
    piezas: string,
    fechaFinal: string,
  ) {
    await this.prisma.$executeRaw`
      UPDATE postv_mantenimientos
      SET observaciones = ${observaciones}, detalle_piezas = ${piezas},
          fecha_final = ${fechaFinal}, estado = 3
      WHERE id_mantenimientos = ${id}
    `;
  }

  async eliminarOrden(id: number) {
    await this.prisma.$executeRaw`
      DELETE FROM postv_mantenimientos WHERE id_mantenimientos = ${id} AND estado = 1
    `;
  }

  async updateFechaRequerida(id: number, fecha: string) {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_mantenimientos
      SET fecha_requerida = ${fecha}
      WHERE id_mantenimientos = ${id}
    `;
  }

  async insertHistFecha(data: {
    idMtto: number;
    nitUser: string;
    fechaSolicitud: string;
    dateOld: string;
    dateNew: string;
  }) {
    await this.prisma.$executeRaw`
      INSERT INTO dbo.postv_mtto_pre_hist_fecha_requerida
        (id_mtto, nit_user, fecha_solicitud, fecha_requerida_old, fecha_requerida_new)
      VALUES
        (${data.idMtto}, ${data.nitUser}, ${data.fechaSolicitud},
         ${data.dateOld}, ${data.dateNew})
    `;
  }

  async equipoExiste(codigo: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<Array<{ codigo: string }>>(
      Prisma.sql`SELECT codigo FROM postv_equipos WHERE codigo = ${codigo}`,
    );
    return rows.length > 0;
  }

  async informePreventivo(estado?: string, bodega?: string) {
    const parts: Prisma.Sql[] = [];
    if (bodega) parts.push(Prisma.sql`e.bodega = ${bodega}`);
    if (estado) parts.push(Prisma.sql`m.estado = ${Number(estado)}`);
    const where =
      parts.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(parts, ' AND ')}`
        : Prisma.empty;
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT m.*, e.nombre_equipo, tr.nombres AS NameResponsable,
             te.nombres AS NameAsignado, e.bodega, e.area
      FROM postv_mantenimientos m
      INNER JOIN postv_equipos e ON e.codigo = m.codigo_equipo
      LEFT JOIN terceros tr ON tr.nit = m.responsable
      LEFT JOIN terceros te ON te.nit = m.asignado
      ${where}
      ORDER BY m.estado ASC
    `);
  }

  async informeCorrectivo(estado?: string, bodega?: string) {
    const parts: Prisma.Sql[] = [];
    if (bodega) parts.push(Prisma.sql`s.sede = ${bodega}`);
    if (estado) parts.push(Prisma.sql`s.estado = ${Number(estado)}`);
    const where =
      parts.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(parts, ' AND ')}`
        : Prisma.empty;
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT s.*, tj.nombres AS Njefe, te.nombres AS Nencargado,
             b.descripcion, e.codigo, e.nombre_equipo
      FROM postv_solicitud_mantenimiento s
      LEFT JOIN terceros tj ON tj.nit = s.jefe
      LEFT JOIN terceros te ON te.nit = s.encargado
      INNER JOIN bodegas b ON b.bodega = s.sede
      LEFT JOIN postv_equipos e ON e.id_equipo = s.id_equipo
      ${where}
      ORDER BY s.estado ASC
    `);
  }

  async getJefeCorreo(nit: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<{ correo: string }>>(
      Prisma.sql`
        SELECT TOP 1 jf.correo
        FROM postv_jefes jf
        WHERE jf.nit_jefe = ${nit}
      `,
    );
    return rows[0]?.correo != null ? asStr(rows[0].correo) : null;
  }
}
