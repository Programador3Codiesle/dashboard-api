import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosChecklistCarro,
  IChecklistCarroRepository,
} from '../../domain/checklist-carro.repository';
import { ChecklistCarroEntity } from '../../domain/checklist-carro.entity';

@Injectable()
export class ChecklistCarroPrismaRepository implements IChecklistCarroRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Misma consulta que legacy `AdministracionCodiesel::get_empleados_jefes($nit_jefe)`.
   * NITs de empleados subordinados para filtrar `doc_conductor`.
   */
  private async obtenerNitsSubordinadosPorNitJefe(nitJefe: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ nit: unknown }[]>`
      SELECT DISTINCT emp.nit AS nit
      FROM postv_jefes j
      INNER JOIN postv_empleado_jefe ej ON ej.jefe = j.id_jefe
      INNER JOIN postv_empleados e ON e.id_empleado = ej.empleado
      INNER JOIN terceros emp ON emp.nit = e.nit_empleado
      WHERE j.nit_jefe = ${nitJefe}
    `;
    return rows
      .map((r) => (r.nit != null ? String(r.nit).trim() : ''))
      .filter((n) => n.length > 0);
  }

  /**
   * Reglas legacy `CheckList::get_inf_check_carro` (switch por perfil).
   */
  private async aplicarFiltrosPorPerfilLegacy(
    conditions: Prisma.Sql[],
    filtros: FiltrosChecklistCarro,
  ): Promise<void> {
    const perfil =
      filtros.perfil != null && Number.isFinite(Number(filtros.perfil))
        ? Number(filtros.perfil)
        : null;

    const idUsuario = Number(filtros.idUsuario);
    const nitUsuario =
      filtros.nitUsuario != null && String(filtros.nitUsuario).trim() !== ''
        ? String(filtros.nitUsuario).trim()
        : '';

    const agregarDocConductorSubordinados = async (): Promise<void> => {
      if (!nitUsuario) {
        conditions.push(Prisma.sql`1=0`);
        return;
      }
      const nits = await this.obtenerNitsSubordinadosPorNitJefe(nitUsuario);
      if (nits.length === 0) {
        conditions.push(Prisma.sql`1=0`);
        return;
      }
      conditions.push(
        Prisma.sql`CAST(doc_conductor AS VARCHAR(100)) IN (${Prisma.join(
          nits.map((n) => Prisma.sql`${n}`),
        )})`,
      );
    };

    if (perfil === null) {
      await agregarDocConductorSubordinados();
      return;
    }

    switch (perfil) {
      case 23:
        conditions.push(Prisma.sql`tipo_vh = ${'Usado'}`);
        break;
      case 51:
        conditions.push(
          Prisma.sql`tipo_vh IN (${Prisma.join([
            Prisma.sql`'Empresa'`,
            Prisma.sql`'TestDrive'`,
          ])})`,
        );
        break;
      case 1:
      case 20:
      case 26: {
        const exentoTipoVh = idUsuario === 437 || idUsuario === 842;
        if (!exentoTipoVh) {
          conditions.push(Prisma.sql`tipo_vh = ${'TestDrive'}`);
        }
        break;
      }
      default:
        await agregarDocConductorSubordinados();
    }
  }

  async listar(filtros: FiltrosChecklistCarro): Promise<{
    items: ChecklistCarroEntity[];
    total: number;
  }> {
    const conditions: Prisma.Sql[] = [];

    if (filtros.fechaIni && filtros.fechaFin) {
      conditions.push(
        Prisma.sql`fecha BETWEEN ${filtros.fechaIni} AND ${filtros.fechaFin}`,
      );
    } else {
      conditions.push(
        Prisma.sql`
          DATEPART(day, fecha) >= 1
          AND DATEPART(month, fecha) = DATEPART(month, GETDATE())
          AND DATEPART(year, fecha) = DATEPART(year, GETDATE())
        `,
      );
    }

    if (filtros.sede && filtros.sede !== '') {
      conditions.push(Prisma.sql`sede LIKE ${filtros.sede}`);
    }

    await this.aplicarFiltrosPorPerfilLegacy(conditions, filtros);

    const where =
      conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    const limiteRaw = filtros.limite ?? 10;
    const paginaRaw = filtros.pagina ?? 1;
    const limit = Math.min(Math.max(Math.floor(Number(limiteRaw)) || 10, 1), 100);
    const page = Math.max(Math.floor(Number(paginaRaw)) || 1, 1);
    const offset = (page - 1) * limit;

    const totalResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*) AS total
      FROM swcrm_check_carro
      ${where}
    `;
    const total = Number(totalResult[0]?.total ?? 0);

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT *
      FROM swcrm_check_carro
      ${where}
      ORDER BY fecha DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const items = rows.map(
      (r) =>
        new ChecklistCarroEntity({
          id: Number(r.id),
          tipo_vh: r.tipo_vh ?? '',
          placa: r.placa ?? '',
          fecha: r.fecha ? new Date(r.fecha).toISOString().split('T')[0] : '',
          sede: r.sede ?? '',
          conductor: r.conductor ?? '',
          doc_conductor: r.doc_conductor ?? '',
          lic_conduccion: r.lic_conduccion ?? 0,
          categoria_lic: r.categoria_lic ?? null,
          fec_vence_lic: r.fec_vence_lic ?? null,
          observacion_lic: r.observacion_lic ?? null,
          porta_documentos: r.porta_documentos ?? 0,
          observacion_documentos: r.observacion_documentos ?? null,
          sol_prueba_ruta: r.sol_prueba_ruta ?? 0,
          asesor: r.asesor ?? null,
          nombre_cliente: r.nombre_cliente ?? null,
          cel_cliente: r.cel_cliente ?? null,
          fec_tecno: r.fec_tecno ?? null,
          tecno: r.tecno ?? 0,
          observacion_tecno: r.observacion_tecno ?? null,
          fec_soat: r.fec_soat ?? null,
          soat: r.soat ?? 0,
          observacion_soat: r.observacion_soat ?? null,
          dir_delanteras: r.dir_delanteras ?? 0,
          observacion_dir_del: r.observacion_dir_del ?? null,
          dir_traseras: r.dir_traseras ?? 0,
          observacion_dir_tra: r.observacion_dir_tra ?? null,
          luces_altas: r.luces_altas ?? 0,
          observacion_altas: r.observacion_altas ?? null,
          luces_bajas: r.luces_bajas ?? 0,
          observacion_bajas: r.observacion_bajas ?? null,
          stops: r.stops ?? 0,
          observacion_stops: r.observacion_stops ?? null,
          luces_reversa: r.luces_reversa ?? 0,
          observacion_reversa: r.observacion_reversa ?? null,
          luces_parqueo: r.luces_parqueo ?? 0,
          observacion_parqueo: r.observacion_parqueo ?? null,
          luces_internas: r.luces_internas ?? 0,
          observacion_internas: r.observacion_internas ?? null,
          limpia_parabrisas: r.limpia_parabrisas ?? 0,
          observacion_plumilla: r.observacion_plumilla ?? null,
          pito: r.pito ?? 0,
          observacion_pito: r.observacion_pito ?? null,
          sist_direccion: r.sist_direccion ?? 0,
          observacion_sist_dir: r.observacion_sist_dir ?? null,
          cinturones: r.cinturones ?? 0,
          observacion_cintu_seg: r.observacion_cintu_seg ?? null,
          airbag: r.airbag ?? 0,
          observacion_airbag: r.observacion_airbag ?? null,
          frenos_princ: r.frenos_princ ?? 0,
          observacion_frenos_prin: r.observacion_frenos_prin ?? null,
          frenos_emergencia: r.frenos_emergencia ?? 0,
          observacion_frenos_emerg: r.observacion_frenos_emerg ?? null,
          llantas: r.llantas ?? 0,
          observacion_llantas: r.observacion_llantas ?? null,
          llanta_repto: r.llanta_repto ?? 0,
          observacion_llanta_repto: r.observacion_llanta_repto ?? null,
          espejos: r.espejos ?? 0,
          observacion_espejos: r.observacion_espejos ?? null,
          nivel_fluidos_frenos: r.nivel_fluidos_frenos ?? 0,
          observacion_fluidos_frenos: r.observacion_fluidos_frenos ?? null,
          nivel_fluidos_aceite: r.nivel_fluidos_aceite ?? 0,
          observacion_fluidos_aceite: r.observacion_fluidos_aceite ?? null,
          nivel_fluidos_refrigerante: r.nivel_fluidos_refrigerante ?? 0,
          observacion_fluidos_refrig: r.observacion_fluidos_refrig ?? null,
          extintor: r.extintor ?? 0,
          fec_extintor: r.fec_extintor ?? null,
          observacion_extintor: r.observacion_extintor ?? null,
          kit_carretera: r.kit_carretera ?? 0,
          observacion_kit_carretera: r.observacion_kit_carretera ?? null,
          botiquin: r.botiquin ?? 0,
          observacion_botiquin: r.observacion_botiquin ?? null,
          quinta_rueda: r.quinta_rueda ?? 0,
          observacion_quinta_rueda: r.observacion_quinta_rueda ?? null,
          mangueras: r.mangueras ?? 0,
          observacion_mangueras_aire: r.observacion_mangueras_aire ?? null,
          nivel_combustible: r.nivel_combustible ?? null,
          kilometraje_salida: r.kilometraje_salida ?? null,
          kilometraje_llegada: r.kilometraje_llegada ?? null,
          observacion_general: r.observacion_general ?? null,
        }),
    );

    return { items, total };
  }
}

