import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { CODIESEL_EMPRESA_ID } from '../../../../../core/config/empresa-sesion';
import {
  FiltrosOrdenSalida,
  IOrdenSalidaRepository,
} from '../../domain/orden-salida.repository';
import { OrdenSalidaEntity } from '../../domain/orden-salida.entity';

const TIPOS_SALIDAS: Record<number, string> = {
  1: 'VH Taller entregado a cliente',
  2: 'Repuestos',
  3: 'Cuatrinario SPV019',
  4: 'N400 WOM803',
  5: 'Niñera TAV656',
  6: 'N300 TTR469',
  7: 'NHR XMB415',
  8: 'VH Usado',
  9: 'Material Publicitario',
  10: 'Test Drive',
  11: 'Equipo de Sistemas',
  12: 'VH Accesorizados',
  13: 'Objetos Varios',
  14: 'Mobiliario',
  15: 'VH Nuevos para entrega',
  16: 'VH Taller prueba de ruta',
  17: 'VH Nuevos sin placa',
  18: 'Vehículos disposición residuos',
  19: 'Herramienta',
  20: 'Traslado a carrocería',
  21: 'NXR Demo Dieselco',
};

const JEFES: Record<number, string> = {
  91274670: 'Carlos Enrique Lozano Galvis',
  1005157209: 'Johan Sebastian Garcia Plata',
  80872884: 'Juan Pablo Mier Avila',
  1095932191: 'Oscar Fernando Ferrer Castro',
  84109954: 'Luis Emilio Puche Aguirre',
  1065913432: 'Manuelita Baleta Mauris',
  1090449765: 'Karol Julieth Gomez Orozco',
  1092358562: 'Zulay Villalba Toloza',
  1094532250: 'Oscar Emilio Romero Urbina',
  91259929: 'Edgar Mauricio Galvis Tavera',
  1095913265: 'Cesar Augusto Caicedo Caycedo',
  1092355065: 'David Davila',
  1096957166: 'Sergio Andres Gomez Matajira',
  1090484563: 'Karen Michelle Barbosa Carvajal',
  13741590: 'Juan Alexander Calderon Blanco',
  63368988: 'Liliana Cristancho Ferreira',
  91525308: 'Elkin Alexander Velasquez Albarracin',
  1014178302: 'Nelson Jose Diaz Rodriguez',
  1098739531: 'Andrea Patricia Parra Ayala',
  1095809978: 'Joseph Dayron Muñoz Gomez',
  91297508: 'Wilson Fiallo Santander',
  91510897: 'Cesar Augusto Dominguez Mosquera',
  1093736472: 'Deysi Lorena Leon Montañez',
  1095816177: 'Gomez Uribe Daniela',
  79984087: 'Oscar Mauricio Tapias Pinto',
  1091655270: 'Eneida Perez Rojas',
  1098625558: 'Zuly Nathalia Ramirez Burgos',
  1099367783: 'Erika Lizeth Aguilar Herrera',
  1128465895: 'Jaime Andres Martinez Barrios',
  1099372035: 'Darly Lizeth Cadena Regueros',
  1004967243: 'Garzon Castro Ingrid Lucero',
  1093791359: 'Quintero Romero Estefany Yajaira',
  1090497067: 'Forero Carrero Heidy Esmeralda',
  37579713: 'Rueda Romero Irene Isabel',
  1094241876: 'Burgos Ramirez Gabriel Felipe',
  79145617: 'Jorge Humberto Franco Rugeles',
  1092338001: 'Andrea Paola Ramirez Ramirez',
  1098679322: 'Daniel Felipe Gonzalez Rueda',
  63289710: 'Yolanda Quintero Ortiz',
  63369607: 'Azucena Franco Gomez',
  91298113: 'Orlando Duran Serrano',
  63541030: 'Johana Uribe Agredo',
};

function columnaEmpresaAusente(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('id_empresa');
}

function toDateString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  return null;
}

function toText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  return null;
}

@Injectable()
export class OrdenSalidaPrismaRepository implements IOrdenSalidaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosOrdenSalida): Promise<OrdenSalidaEntity[]> {
    try {
      return await this.ejecutarListar(filtros, true);
    } catch (firstErr: unknown) {
      if (!columnaEmpresaAusente(firstErr)) {
        throw firstErr;
      }
      if (
        filtros.empresaId != null &&
        filtros.empresaId !== CODIESEL_EMPRESA_ID
      ) {
        return [];
      }
      return this.ejecutarListar(filtros, false);
    }
  }

  private async ejecutarListar(
    filtros: FiltrosOrdenSalida,
    filtrarEmpresa: boolean,
  ): Promise<OrdenSalidaEntity[]> {
    const sql = this.buildListarSql(filtros, filtrarEmpresa);
    const rows = await this.prisma.$queryRaw<Record<string, unknown>[]>(sql);
    return rows.map((r) => this.mapRow(r));
  }

  private buildListarSql(
    filtros: FiltrosOrdenSalida,
    filtrarEmpresa: boolean,
  ): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];
    const nitUsuario =
      filtros.nitUsuario != null ? Number(filtros.nitUsuario) : null;

    if (filtros.fechaIni && filtros.fechaFin) {
      conditions.push(
        Prisma.sql`CONVERT(VARCHAR, fecha_salida, 23) BETWEEN ${filtros.fechaIni} AND ${filtros.fechaFin}`,
      );
    } else {
      conditions.push(
        Prisma.sql`CONVERT(VARCHAR, fecha_salida, 34) = CONVERT(VARCHAR, GETDATE(), 34)`,
      );
    }

    if (nitUsuario !== 63369607 && nitUsuario !== 1098679322) {
      switch (nitUsuario) {
        case 23423443:
          conditions.push(Prisma.sql`sede = 'Giron'`);
          break;
        case 23423444:
          conditions.push(Prisma.sql`sede = 'Bocono'`);
          break;
        case 23423445:
          conditions.push(Prisma.sql`sede = 'Rosita'`);
          break;
        case 23423446:
          conditions.push(Prisma.sql`sede = 'Barrancabermeja'`);
          break;
        default:
          if (nitUsuario != null && Number.isFinite(nitUsuario)) {
            conditions.push(Prisma.sql`jefe = ${nitUsuario}`);
          }
          break;
      }
    }

    if (filtros.jefe) {
      const jefeNit = Number(filtros.jefe);
      if (Number.isFinite(jefeNit)) {
        conditions.push(Prisma.sql`jefe = ${jefeNit}`);
      }
    }
    if (filtros.area) {
      conditions.push(Prisma.sql`area = ${filtros.area}`);
    }
    if (filtros.sede) {
      conditions.push(Prisma.sql`sede = ${filtros.sede}`);
    }
    if (filtros.tipoSalida != null) {
      conditions.push(Prisma.sql`tipoSalida = ${filtros.tipoSalida}`);
    }

    if (filtrarEmpresa && filtros.empresaId != null) {
      conditions.push(
        Prisma.sql`ISNULL(id_empresa, ${CODIESEL_EMPRESA_ID}) = ${filtros.empresaId}`,
      );
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    return Prisma.sql`
      SELECT *, CASE WHEN observacion IS NULL THEN 1 ELSE 0 END AS observacion_null_flag
      FROM swcrm_formato_ordenSalida
      ${where}
      ORDER BY observacion_null_flag ASC, fecha_salida ASC
    `;
  }

  private mapRow(r: Record<string, unknown>): OrdenSalidaEntity {
    const jefe = Number(r.jefe);
    const tipoSalida = Number(r.tipoSalida);
    const observacion = toText(r.observacion);
    return new OrdenSalidaEntity({
      id: Number(r.id),
      area: toText(r.area),
      sede: toText(r.sede),
      jefe,
      tipoSalida,
      explicacion: toText(r.explicacion) ?? '',
      fecha_salida: toDateString(r.fecha_salida) ?? '',
      fecha_reg: toDateString(r.fecha_reg),
      placa: toText(r.placa),
      conductor: toText(r.conductor),
      quienSale: toText(r.quienSale),
      observacion,
      fecha_reg_obs: toDateString(r.fecha_reg_obs),
      jefeNombre: JEFES[jefe] ?? toText(r.jefe) ?? '',
      tipoSalidaNombre: TIPOS_SALIDAS[tipoSalida] ?? toText(r.tipoSalida) ?? '',
      tieneObservacion: observacion != null && observacion !== '',
    });
  }

  async guardarObservacion(id: number, observacion: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE swcrm_formato_ordenSalida
      SET observacion = ${observacion},
          fecha_reg_obs = CONVERT(VARCHAR, GETDATE(), 126)
      WHERE id = ${id}
    `;
  }
}
