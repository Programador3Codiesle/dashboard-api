import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosOrdenSalida,
  IOrdenSalidaRepository,
} from '../../domain/orden-salida.repository';
import { OrdenSalidaEntity } from '../../domain/orden-salida.entity';

@Injectable()
export class OrdenSalidaPrismaRepository implements IOrdenSalidaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosOrdenSalida): Promise<OrdenSalidaEntity[]> {
    const conditions: Prisma.Sql[] = [];
    const nitUsuario = filtros.nitUsuario != null ? Number(filtros.nitUsuario) : null;

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
      conditions.push(Prisma.sql`jefe = ${filtros.jefe}`);
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

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const sql = Prisma.sql`
      SELECT
        id,
        area,
        sede,
        jefe,
        tipoSalida,
        explicacion,
        CONVERT(VARCHAR, fecha_salida, 23) AS fecha_salida,
        placa,
        conductor,
        quienSale,
        observacion,
        fecha_reg_obs,
        CASE WHEN observacion IS NULL THEN 1 ELSE 0 END AS observacion_null_flag
      FROM swcrm_formato_ordenSalida
      ${where}
      ORDER BY observacion_null_flag ASC, fecha_salida ASC
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await this.prisma.$queryRaw<any[]>(sql);

    const tipos_salidas: Record<number, string> = {
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

    const jefes: Record<number, string> = {
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

    return rows.map(
      (r) =>
        new OrdenSalidaEntity({
          ...r,
          id: Number(r.id),
          jefeNombre: jefes[r.jefe as number] ?? String(r.jefe),
          tipoSalidaNombre: tipos_salidas[r.tipoSalida as number] ?? String(r.tipoSalida),
          tieneObservacion: r.observacion !== null && r.observacion !== '',
        }),
    );
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

