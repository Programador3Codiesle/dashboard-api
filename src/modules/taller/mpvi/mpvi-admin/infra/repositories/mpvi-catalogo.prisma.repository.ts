import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  CatalogoOption,
  IMpviCatalogoRepository,
} from '../../domain/mpvi-catalogo.repository';

@Injectable()
export class MpviCatalogoPrismaRepository implements IMpviCatalogoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async procesarSistema(sistema: string): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<{ id_sistema: number }[]>`
      SELECT id_sistema FROM postv_mpvi_sistemas WHERE sistema = ${sistema}
    `;
    if (rows.length > 0) return rows[0].id_sistema;

    const inserted = await this.prisma.$queryRaw<{ id_sistema: number }[]>`
      INSERT INTO postv_mpvi_sistemas (sistema)
      OUTPUT INSERTED.id_sistema
      VALUES (${sistema})
    `;
    return inserted[0]?.id_sistema ?? null;
  }

  async procesarSubsistema(
    idSistema: number,
    subsistema: string,
  ): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<{ id_subsistema: number }[]>`
      SELECT id_subsistema FROM postv_mpvi_subsistemas WHERE subsistema = ${subsistema}
    `;
    if (rows.length > 0) return rows[0].id_subsistema;

    const inserted = await this.prisma.$queryRaw<{ id_subsistema: number }[]>`
      INSERT INTO postv_mpvi_subsistemas (id_sistema, subsistema)
      OUTPUT INSERTED.id_subsistema
      VALUES (${idSistema}, ${subsistema})
    `;
    return inserted[0]?.id_subsistema ?? null;
  }

  async buscarIdVh(
    idFamilia: number,
    clase: string,
    anoInicial: number | null,
  ): Promise<number | null> {
    const claseNorm = clase.toUpperCase().trim();
    const rows =
      anoInicial === null
        ? await this.prisma.$queryRaw<{ id_vh: number }[]>`
            SELECT TOP 1 id_vh FROM postv_mpvi_vh
            WHERE id_familia = ${idFamilia}
              AND ano_inicial IS NULL
              AND UPPER(LTRIM(RTRIM(ISNULL(clase, '')))) = UPPER(LTRIM(RTRIM(${claseNorm})))
            ORDER BY CASE WHEN id_subsistema IS NULL THEN 0 ELSE 1 END, id_vh ASC
          `
        : await this.prisma.$queryRaw<{ id_vh: number }[]>`
            SELECT TOP 1 id_vh FROM postv_mpvi_vh
            WHERE id_familia = ${idFamilia}
              AND ano_inicial = ${anoInicial}
              AND UPPER(LTRIM(RTRIM(ISNULL(clase, '')))) = UPPER(LTRIM(RTRIM(${claseNorm})))
            ORDER BY CASE WHEN id_subsistema IS NULL THEN 0 ELSE 1 END, id_vh ASC
          `;
    return rows[0]?.id_vh ?? null;
  }

  async resolverIdVhCanonico(idVh: number): Promise<number | null> {
    if (idVh <= 0) return null;
    const rows = await this.prisma.$queryRaw<
      { id_familia: number; clase: string; ano_inicial: number }[]
    >`
      SELECT id_familia, clase, ano_inicial FROM postv_mpvi_vh WHERE id_vh = ${idVh}
    `;
    if (rows.length === 0) return idVh;
    const row = rows[0];
    const canonico = await this.buscarIdVh(
      row.id_familia,
      row.clase ?? '',
      row.ano_inicial ?? null,
    );
    return canonico ?? idVh;
  }

  async procesarVh(
    idSubsistema: number | null,
    idFamilia: number,
    clase: string,
    anoInicial: number | null,
    anoFinal: number | null,
  ): Promise<number | null> {
    const claseNorm = clase.toUpperCase().trim();
    const existente = await this.buscarIdVh(idFamilia, claseNorm, anoInicial);
    if (existente !== null) return existente;

    const inserted = await this.prisma.$queryRaw<{ id_vh: number }[]>`
      INSERT INTO postv_mpvi_vh (id_familia, clase, ano_inicial, ano_final, id_subsistema)
      OUTPUT INSERTED.id_vh
      VALUES (${idFamilia}, ${claseNorm}, ${anoInicial}, ${anoFinal}, ${idSubsistema})
    `;
    return inserted[0]?.id_vh ?? null;
  }

  async procesarManoObra(
    idSubsistema: number,
    idVh: number,
    idTempario: number,
    tiempo: number,
  ): Promise<number | null> {
    const inserted = await this.prisma.$queryRaw<{ id_mano_obra: number }[]>`
      INSERT INTO postv_mpvi_mano_obra (id_vh, id_subsistema, id_tempario, tiempo)
      OUTPUT INSERTED.id_mano_obra
      VALUES (${idVh}, ${idSubsistema}, ${idTempario}, ${tiempo})
    `;
    return inserted[0]?.id_mano_obra ?? null;
  }

  async procesarRepuestos(
    idSubsistema: number,
    idVh: number,
    codigo: string,
    cantidad: number,
  ): Promise<number | null> {
    const inserted = await this.prisma.$queryRaw<{ id_repuesto: number }[]>`
      INSERT INTO postv_mpvi_repuestos (id_vh, id_subsistema, codigo, cantidad)
      OUTPUT INSERTED.id_repuesto
      VALUES (${idVh}, ${idSubsistema}, ${codigo}, ${cantidad})
    `;
    return inserted[0]?.id_repuesto ?? null;
  }

  async procesarReferencias(
    idRepuesto: number,
    alterno1: string,
    alterno2?: string | null,
    alterno3?: string | null,
  ): Promise<number | null> {
    const inserted = await this.prisma.$queryRaw<{ id_referencia: number }[]>`
      INSERT INTO postv_mpvi_referencias (id_repuesto, alterno1, alterno2, alterno3)
      OUTPUT INSERTED.id_referencia
      VALUES (${idRepuesto}, ${alterno1}, ${alterno2 ?? null}, ${alterno3 ?? null})
    `;
    return inserted[0]?.id_referencia ?? null;
  }

  async getSistemas(): Promise<CatalogoOption[]> {
    return this.prisma.$queryRaw<CatalogoOption[]>`
      SELECT id_sistema as id, sistema as label FROM postv_mpvi_sistemas
    `;
  }

  async getSubsistemas(): Promise<CatalogoOption[]> {
    return this.prisma.$queryRaw<CatalogoOption[]>`
      SELECT id_subsistema as id, subsistema as label FROM postv_mpvi_subsistemas
    `;
  }

  async getFamiliasVh(): Promise<CatalogoOption[]> {
    return this.prisma.$queryRaw<CatalogoOption[]>`
      SELECT id, descripcion as label FROM vh_familias
    `;
  }

  async getVehiculos(): Promise<CatalogoOption[]> {
    return this.prisma.$queryRaw<CatalogoOption[]>`
      SELECT id_vh AS id, label
      FROM (
        SELECT v.id_vh,
          f.descripcion + ' - ' + ISNULL(v.clase, '') + ' ' + CONVERT(VARCHAR, v.ano_inicial) + '/' + CONVERT(VARCHAR, ISNULL(v.ano_final, YEAR(GETDATE()))) AS label,
          ROW_NUMBER() OVER (
            PARTITION BY v.id_familia, UPPER(LTRIM(RTRIM(ISNULL(v.clase, '')))), v.ano_inicial
            ORDER BY CASE WHEN v.id_subsistema IS NULL THEN 0 ELSE 1 END, v.id_vh ASC
          ) AS rn
        FROM postv_mpvi_vh v
        INNER JOIN vh_familias f ON f.id = v.id_familia
      ) AS vh_unicos
      WHERE rn = 1
      ORDER BY label ASC
    `;
  }

  async getRepuestos(): Promise<CatalogoOption[]> {
    return this.prisma.$queryRaw<CatalogoOption[]>`
      SELECT id_repuesto as id, codigo as label FROM postv_mpvi_repuestos
    `;
  }

  async saveData(
    op: number,
    data: Record<string, unknown>,
  ): Promise<boolean | number> {
    if (op === 2) {
      const idVh = await this.procesarVh(
        this.parseOptionalCatalogId(data.id_subsistema),
        Number(data.id_familia),
        String(data.clase ?? ''),
        this.parseOptionalCatalogInt(data.ano_inicial),
        this.parseOptionalCatalogInt(data.ano_final),
      );
      return idVh ? 1 : 0;
    }

    if ((op === 3 || op === 4) && data.id_vh != null) {
      const canonico = await this.resolverIdVhCanonico(Number(data.id_vh));
      if (!canonico) return false;
      data.id_vh = canonico;
    }

    try {
      switch (op) {
        case 0:
          await this.prisma.$executeRaw`
            INSERT INTO postv_mpvi_sistemas (sistema) VALUES (${String(data.sistema)})
          `;
          break;
        case 1:
          await this.prisma.$executeRaw`
            INSERT INTO postv_mpvi_subsistemas (id_sistema, subsistema)
            VALUES (${Number(data.id_sistema)}, ${String(data.subsistema)})
          `;
          break;
        case 3:
          await this.prisma.$executeRaw`
            INSERT INTO postv_mpvi_mano_obra (id_vh, id_subsistema, id_tempario, tiempo)
            VALUES (${Number(data.id_vh)}, ${Number(data.id_subsistema)}, ${Number(data.id_tempario)}, ${Number(data.tiempo)})
          `;
          break;
        case 4:
          await this.prisma.$executeRaw`
            INSERT INTO postv_mpvi_repuestos (id_vh, id_subsistema, codigo, cantidad)
            VALUES (${Number(data.id_vh)}, ${Number(data.id_subsistema)}, ${String(data.codigo)}, ${Number(data.cantidad)})
          `;
          break;
        case 5:
          await this.prisma.$executeRaw`
            INSERT INTO postv_mpvi_referencias (id_repuesto, alterno1, alterno2, alterno3)
            VALUES (${Number(data.id_repuesto)}, ${String(data.alterno1)}, ${data.alterno2 ?? null}, ${data.alterno3 ?? null})
          `;
          break;
        default:
          return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async deleteDataTabla(tabla: number): Promise<void> {
    const tablas = [
      'postv_maestro_gmica',
      'postv_maestro_repuestos_gm',
      'postv_reemplazos_repuestos',
    ];
    const nombre = tablas[tabla];
    if (!nombre) return;
    await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${nombre}`);
  }

  async almacenarDatosGmica(row: string[]): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO postv_maestro_gmica (codigo, familia, segmento, modelo, descripcion, tipo, core, notas)
        VALUES (${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]}, ${row[7]})
      `;
      return true;
    } catch {
      return false;
    }
  }

  async almacenarDatosRepuestos(row: string[]): Promise<boolean> {
    try {
      const fechaFinal = row[7] != null && row[7] !== '' ? row[7] : null;
      if (fechaFinal) {
        await this.prisma.$executeRaw`
          INSERT INTO postv_maestro_repuestos_gm (
            codigo, descripcion, plataforma, main, modelo, segmento, fecha_inicial,
            fecha_final, bajo_movimiento, obsoleto, planificador_mrp, centro_beneficio,
            indicador_abc, st_material, tp_mrp, segmento_parte
          ) VALUES (
            ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]},
            ${fechaFinal}, ${row[8]}, ${row[9]}, ${row[10]}, ${row[11]},
            ${row[12]}, ${row[13]}, ${row[14]}, ${row[15]}
          )
        `;
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO postv_maestro_repuestos_gm (
            codigo, descripcion, plataforma, main, modelo, segmento, fecha_inicial,
            bajo_movimiento, obsoleto, planificador_mrp, centro_beneficio,
            indicador_abc, st_material, tp_mrp, segmento_parte
          ) VALUES (
            ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]},
            ${row[8]}, ${row[9]}, ${row[10]}, ${row[11]},
            ${row[12]}, ${row[13]}, ${row[14]}, ${row[15]}
          )
        `;
      }
      return true;
    } catch {
      return false;
    }
  }

  async almacenarDatosReemplazos(row: string[]): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO postv_reemplazos_repuestos (
          centro, codigo_ant, id_cad_Supersesess, codigo_nuevo, id_cadena, fecha_creacion
        ) VALUES (${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]})
      `;
      return true;
    } catch {
      return false;
    }
  }

  private parseOptionalCatalogInt(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private parseOptionalCatalogId(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  }
}
