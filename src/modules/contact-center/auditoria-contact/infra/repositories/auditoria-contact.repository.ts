import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import type { AuditoriaEmailInfo } from '../../application/auditoria-contact-email.service';

export type IndicadorRow = {
  id_indicador: number;
  nombres: string;
  puntuacion: number;
  estado: number;
};

export type ItemRow = {
  id_item: number;
  id_indicador: number;
  concepto: string;
  estado: number;
};

export type ObsRow = {
  id_obs: number;
  id_item: number;
  observacion: string;
  estado: number;
};

@Injectable()
export class AuditoriaContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUserAgente(): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw(Prisma.sql`
      SELECT u.id_usuario, p.nom_perfil, t.nombres, u.usuario, t.nit, u.estado
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      LEFT JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
      WHERE p.id_perfil = 31
    `);
  }

  async getIndicadores(): Promise<IndicadorRow[]> {
    return this.prisma.$queryRaw<IndicadorRow[]>(Prisma.sql`
      SELECT * FROM dbo.postv_auditoria_indicador
    `);
  }

  async getItems(idIndicador: number): Promise<ItemRow[]> {
    return this.prisma.$queryRaw<ItemRow[]>(Prisma.sql`
      SELECT * FROM dbo.postv_auditoria_indicador_item WHERE id_indicador = ${idIndicador}
    `);
  }

  async getItemsHabilitados(idIndicador: number): Promise<ItemRow[]> {
    return this.prisma.$queryRaw<ItemRow[]>(Prisma.sql`
      SELECT * FROM dbo.postv_auditoria_indicador_item
      WHERE id_indicador = ${idIndicador} AND estado = 2
    `);
  }

  async getAllItems(soloHabilitados: boolean): Promise<ItemRow[]> {
    if (soloHabilitados) {
      return this.prisma.$queryRaw<ItemRow[]>(Prisma.sql`
        SELECT * FROM dbo.postv_auditoria_indicador_item WHERE estado = 2
      `);
    }
    return this.prisma.$queryRaw<ItemRow[]>(Prisma.sql`
      SELECT * FROM dbo.postv_auditoria_indicador_item
    `);
  }

  async getObsActivasByItems(itemIds: number[]): Promise<ObsRow[]> {
    if (itemIds.length === 0) return [];
    const idList = Prisma.join(itemIds.map((id) => Prisma.sql`${id}`));
    return this.prisma.$queryRaw<ObsRow[]>(Prisma.sql`
      SELECT * FROM dbo.postv_auditoria_item_obs
      WHERE id_item IN (${idList}) AND estado = 2
    `);
  }

  async getCantPreguntas(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ cantidad: number }>>(Prisma.sql`
      SELECT COUNT(*) as cantidad FROM dbo.postv_auditoria_indicador_item
    `);
    return Number(rows[0]?.cantidad ?? 0);
  }

  async insertAuditoria(
    nitAgente: number,
    nitEncargado: number,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      INSERT INTO dbo.postv_auditoria_agente (nit_agente, fecha_creacion, nit_encargado)
      OUTPUT INSERTED.id_auditoria AS id
      VALUES (${nitAgente}, SYSDATETIME(), ${nitEncargado})
    `);
    return Number(rows[0]?.id ?? 0);
  }

  async updateRespuesta(
    idAuditoria: number,
    idItem: number,
    opt: number,
  ): Promise<boolean> {
    const col = `[item_${idItem}]`;
    const result = await this.prisma.$executeRaw(
      Prisma.sql`UPDATE postv_auditoria_agente SET ${Prisma.raw(col)} = ${opt} WHERE id_auditoria = ${idAuditoria}`,
    );
    return result > 0;
  }

  async finalizarAuditoria(
    idAuditoria: number,
    puntuacion: number,
    obsAuditor: string,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_auditoria_agente
      SET puntuacion = ${puntuacion},
          fecha_finalizacion = SYSDATETIME(),
          observaciones = ${obsAuditor}
      WHERE id_auditoria = ${idAuditoria}
    `);
    return result > 0;
  }

  async getAuditoriaAgentesAll(
    nitAgente?: number,
  ): Promise<Record<string, unknown>[]> {
    const where = nitAgente
      ? Prisma.sql`WHERE ae.nit_agente = ${nitAgente}`
      : Prisma.empty;

    return this.prisma.$queryRaw(Prisma.sql`
      SELECT ae.id_auditoria, ae.nit_agente, t.nombres, ae.fecha_creacion,
        ae.fecha_finalizacion, ae.puntuacion, ae.compromiso
      FROM dbo.postv_auditoria_agente ae
      INNER JOIN terceros t ON t.nit = ae.nit_agente
      ${where}
      ORDER BY id_auditoria DESC
    `);
  }

  async getAuditoriaId(idAuditoria: number): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT ae.id_auditoria, ae.nit_agente, t.nombres, ae.fecha_creacion,
        ae.fecha_finalizacion, ae.puntuacion, ae.*
      FROM dbo.postv_auditoria_agente ae
      INNER JOIN terceros t ON t.nit = ae.nit_agente
      WHERE ae.id_auditoria = ${idAuditoria}
    `);
    return rows[0] ?? null;
  }

  async getAllFilesAuditoriaId(
    idAuditoria: number,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw(Prisma.sql`
      SELECT * FROM dbo.postv_auditoria_agente_files WHERE id_auditoria = ${idAuditoria}
    `);
  }

  async addFilesAuditoria(
    idAuditoria: number,
    urlFile: string,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO dbo.postv_auditoria_agente_files (id_auditoria, url_file, fecha_registro)
      VALUES (${idAuditoria}, ${urlFile}, SYSDATETIME())
    `);
    return result > 0;
  }

  async updateIndicadores(idIndicador: number, puntos: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_auditoria_indicador SET puntuacion = ${puntos} WHERE id_indicador = ${idIndicador}
    `);
    return result > 0;
  }

  async insertIndicador(nombre: string, puntos: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_auditoria_indicador (nombres, puntuacion, estado)
      VALUES (${nombre}, ${puntos}, 2)
    `);
    return result > 0;
  }

  async insertItemXind(idIndicador: number, concepto: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      INSERT INTO postv_auditoria_indicador_item (id_indicador, concepto, estado)
      OUTPUT INSERTED.id_item AS id
      VALUES (${idIndicador}, ${concepto}, 2)
    `);
    return Number(rows[0]?.id ?? 0);
  }

  async addPreguntaAuditoria(idItem: number): Promise<boolean> {
    const col = `[item_${idItem}]`;
    await this.prisma.$executeRaw(
      Prisma.sql`ALTER TABLE postv_auditoria_agente ADD ${Prisma.raw(col)} tinyint NULL`,
    );
    return true;
  }

  async getObsXitem(idItem: number): Promise<ObsRow[]> {
    return this.prisma.$queryRaw<ObsRow[]>(Prisma.sql`
      SELECT * FROM postv_auditoria_item_obs WHERE id_item = ${idItem}
    `);
  }

  async getObsXitemActivos(idItem: number): Promise<ObsRow[]> {
    return this.prisma.$queryRaw<ObsRow[]>(Prisma.sql`
      SELECT * FROM postv_auditoria_item_obs WHERE id_item = ${idItem} AND estado = 2
    `);
  }

  async insertObsXitem(idItem: number, obs: string): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_auditoria_item_obs (id_item, observacion, estado)
      VALUES (${idItem}, ${obs}, 2)
    `);
    return result > 0;
  }

  async estadoIndicador(idIndicador: number, estado: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_auditoria_indicador SET estado = ${estado} WHERE id_indicador = ${idIndicador}
    `);
    return result > 0;
  }

  async estadoItem(idItem: number, estado: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_auditoria_indicador_item SET estado = ${estado} WHERE id_item = ${idItem}
    `);
    return result > 0;
  }

  async estadoObservacion(idObs: number, estado: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_auditoria_item_obs SET estado = ${estado} WHERE id_obs = ${idObs}
    `);
    return result > 0;
  }

  async getAuditoriaEmail(idAuditoria: number): Promise<AuditoriaEmailInfo | null> {
    const rows = await this.prisma.$queryRaw<AuditoriaEmailInfo[]>(Prisma.sql`
      SELECT t.primer_nombre, e.e_mail as mailEncargado, c.nombre, c.e_mail, a.observaciones
      FROM postv_auditoria_agente a
      LEFT JOIN (SELECT * FROM CRM_contactos WHERE contacto = 1) c ON c.nit = a.nit_agente
      LEFT JOIN terceros_nombres t ON t.nit = a.nit_agente
      LEFT JOIN (SELECT * FROM CRM_contactos WHERE contacto = 1) e ON e.nit = a.nit_encargado
      WHERE id_auditoria = ${idAuditoria}
    `);
    return rows[0] ?? null;
  }

  async insertCompromisoAuditoria(
    idAuditoria: number,
    compromisos: string,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_auditoria_agente SET compromiso = ${compromisos} WHERE id_auditoria = ${idAuditoria}
    `);
    return result > 0;
  }

  async getDetalleAuditoria(
    nitAgente: number,
    year: number,
    month: number,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw(Prisma.sql`
      SELECT CONVERT(varchar, fecha_creacion, 103) as fecha_c, *
      FROM postv_auditoria_agente
      WHERE YEAR(fecha_creacion) = ${year}
        AND MONTH(fecha_creacion) = ${month}
        AND nit_agente = ${nitAgente}
      ORDER BY fecha_creacion DESC
    `);
  }

  async countAuditoriasPendientes(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ cantidad: number }>>(Prisma.sql`
      SELECT COUNT(*) AS cantidad FROM postv_auditoria_agente a WHERE a.fecha_finalizacion IS NULL
    `);
    return Number(rows[0]?.cantidad ?? 0);
  }
}
