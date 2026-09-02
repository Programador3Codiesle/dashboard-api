import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosComisionesAsesoresRepuestos,
  FiltrosDetalleComisionAsesorRepuesto,
  IComisionesAsesoresRepuestosRepository,
} from '../../domain/comisiones-asesores-repuestos.repository';
import {
  ComisionAsesorRepuestoEntity,
  DetalleComisionAsesorRepuestoEntity,
} from '../../domain/comisiones-asesores-repuestos.entity';
import { PERFILES_COMISIONES_ASESORES_FILTRO_SESION } from '../../domain/comisiones-asesores-repuestos.constants';
import { perfilEn } from '../../../shared/perfil';

type AggregationRow = {
  subtotal: number | null;
  descuento: number | null;
  costo_neto: number | null;
  venta_neta: number | null;
  utilidad: number | null;
  margen: number | null;
};

interface AsesorConfig {
  nombre: string;
  sede: string;
}

interface TotalesComisionData {
  subtotal: number;
  descuento: number;
  ventaNeta: number;
  costoNeto: number;
  utilidad: number;
  margen: number;
}

@Injectable()
export class ComisionesAsesoresRepuestosPrismaRepository implements IComisionesAsesoresRepuestosRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly asesoresBase: AsesorConfig[] = [
    { nombre: 'QUIÑONEZ NAVAS DIEGO ALONSO', sede: 'MOSTRADOR' },
    { nombre: 'QUIÑONEZ NAVAS DIEGO ALONSO', sede: 'TALLER' },
    { nombre: 'CASTRO BLANCO LUIS EDUARDO', sede: 'SOLOCHEVROLET' },
    { nombre: 'OLAYA CALDERON JOSE ALLENDY', sede: 'MOSTRADOR-MAYOR' },
    { nombre: 'OLAYA CALDERON JOSE ALLENDY', sede: 'TALLER' },
    { nombre: 'CARRILLO ANGARITA FIDEL', sede: 'CUCUTA ASEGURADORA' },
    { nombre: 'RANGEL REYES CRISTIAN ORLANDO', sede: 'CUCUTA MOSTRADOR' },
    {
      nombre: 'RANGEL REYES CRISTIAN ORLANDO',
      sede: 'CUCUTA MOSTRADOR MULTIMARCAS',
    },
    {
      nombre: 'CHAPARRO HIGUERA YESLLY KARINA',
      sede: 'TUNJA MOSTRADOR MULTIMARCAS',
    },
    { nombre: 'LOPEZ JUAN MANUEL', sede: 'CUCUTA TALLER' },
    { nombre: 'CADENA RAMIREZ FERNANDO ANTONIO', sede: 'GIRON ASEGURADORA' },
    { nombre: 'ABRIL RAMIREZ LEONARDO', sede: 'GIRON TALLER' },
    { nombre: 'ARDILA SANCHEZ JOSUE', sede: 'GIRON MOSTRADOR' },
    { nombre: 'ARDILA SANCHEZ JOSUE', sede: 'GIRON ASEGURADORA-TALLER' },
    { nombre: 'MEJIA VARGAS OSCAR ALFONSO', sede: 'GIRON ASEGURADORA' },
    {
      nombre: 'VILLAMIZAR CASTILLO CAMILO ANDRES',
      sede: 'CHEVROPARTES MAYOR',
    },
    {
      nombre: 'VILLAMIZAR CASTILLO CAMILO ANDRES',
      sede: 'CHEVROPARTES MOSTRADOR',
    },
    {
      nombre: 'VILLAMIZAR CASTILLO CAMILO ANDRES',
      sede: 'CHEVROPARTES ACEITE GRANEL',
    },
  ];

  async listarComisiones(
    filtros: FiltrosComisionesAsesoresRepuestos,
  ): Promise<ComisionAsesorRepuestoEntity[]> {
    const { mes, ano, perfilUsuario, nombreUsuarioSesion } = filtros;
    let asesores = [...this.asesoresBase];

    if (perfilEn(perfilUsuario, PERFILES_COMISIONES_ASESORES_FILTRO_SESION)) {
      const buscado = (nombreUsuarioSesion ?? '').trim().toUpperCase();
      asesores = buscado
        ? asesores.filter((a) => a.nombre.toUpperCase() === buscado)
        : [];
    }

    const rows: ComisionAsesorRepuestoEntity[] = [];

    for (const asesor of asesores) {
      const row = await this.calcularFilaAsesor(asesor, mes, ano);
      if (row) {
        rows.push(row);
      }
    }

    return rows;
  }

  async obtenerDetalle(
    filtros: FiltrosDetalleComisionAsesorRepuesto,
  ): Promise<DetalleComisionAsesorRepuestoEntity[]> {
    const { nom, sede, mes, ano } = filtros;
    const detalle: DetalleComisionAsesorRepuestoEntity[] = [];

    const addDetalle = (data: TotalesComisionData, tipo: string) => {
      detalle.push(
        new DetalleComisionAsesorRepuestoEntity({
          nombre: nom,
          subtotal: data.subtotal,
          descuento: data.descuento,
          ventaNeta: data.ventaNeta,
          costoNeto: data.costoNeto,
          utilidad: data.utilidad,
          margenBruto: data.margen,
          tipo,
        }),
      );
    };

    switch (nom) {
      case 'QUIÑONEZ NAVAS DIEGO ALONSO': {
        if (sede === 'MOSTRADOR') {
          addDetalle(await this.queryMostradorBase(nom, mes, ano), sede);
        } else if (sede === 'TALLER') {
          addDetalle(await this.queryTallerBase('QDIEGO', mes, ano), sede);
        }
        break;
      }
      case 'CASTRO BLANCO LUIS EDUARDO': {
        addDetalle(await this.queryMostradorLuisE(nom, mes, ano), sede);
        break;
      }
      case 'OLAYA CALDERON JOSE ALLENDY': {
        if (sede === 'MOSTRADOR-MAYOR') {
          addDetalle(await this.queryMostradorBase(nom, mes, ano), sede);
        } else if (sede === 'TALLER') {
          addDetalle(await this.queryTallerBase('JOLAYA', mes, ano), sede);
        }
        break;
      }
      case 'CARRILLO ANGARITA FIDEL': {
        addDetalle(await this.queryMostradorBase(nom, mes, ano), 'MOSTRADOR');
        addDetalle(await this.queryTallerBase('FIDEL', mes, ano), 'TALLER');
        break;
      }
      case 'RANGEL REYES CRISTIAN ORLANDO': {
        addDetalle(await this.queryMostradorBase(nom, mes, ano), 'MOSTRADOR');
        addDetalle(await this.queryTallerBase('CRANGEL', mes, ano), 'TALLER');
        break;
      }
      case 'LOPEZ JUAN MANUEL': {
        addDetalle(await this.queryMostradorBase(nom, mes, ano), 'MOSTRADOR');
        addDetalle(await this.queryTallerBase('JMANUEL', mes, ano), 'TALLER');
        break;
      }
      case 'CADENA RAMIREZ FERNANDO ANTONIO': {
        addDetalle(await this.queryMostradorBase(nom, mes, ano), 'MOSTRADOR');
        addDetalle(await this.queryTallerBase('FERNANDO', mes, ano), 'TALLER');
        break;
      }
      case 'ABRIL RAMIREZ LEONARDO': {
        addDetalle(await this.queryMostradorBase(nom, mes, ano), 'MOSTRADOR');
        addDetalle(await this.queryTallerBase('LEONARDO', mes, ano), 'TALLER');
        addDetalle(
          await this.queryTallerBase('M-ABRIL', mes, ano),
          'MOSTRADOR-MAYOR',
        );
        break;
      }
      case 'ARDILA SANCHEZ JOSUE': {
        if (sede === 'GIRON MOSTRADOR') {
          addDetalle(await this.queryMostradorBase(nom, mes, ano), 'MOSTRADOR');
        } else if (sede === 'GIRON ASEGURADORA-TALLER') {
          addDetalle(
            await this.queryTallerBase('JARDILA', mes, ano),
            'ASEGURADORA-TALLER',
          );
        }
        break;
      }
      case 'VILLAMIZAR CASTILLO CAMILO ANDRES': {
        if (sede === 'CHEVROPARTES MAYOR') {
          addDetalle(
            await this.queryMostradorMayor(nom, mes, ano),
            'CHEVROPARTES-MAYOR',
          );
        } else if (sede === 'CHEVROPARTES MOSTRADOR') {
          addDetalle(
            await this.queryMostradorSinMayor(nom, mes, ano),
            'CHEVROPARTES-MOSTRADOR',
          );
        } else if (sede === 'CHEVROPARTES ACEITE GRANEL') {
          addDetalle(
            await this.queryMostradorAceite(nom, mes, ano),
            'CHEVROPARTES ACEITE GRANEL',
          );
        }
        break;
      }
      case 'MEJIA VARGAS OSCAR ALFONSO': {
        addDetalle(
          await this.queryMostradorBase(nom, mes, ano),
          'CHEVROPARTES-MOSTRADOR',
        );
        break;
      }
      default:
        break;
    }

    return detalle;
  }

  private async calcularFilaAsesor(
    asesor: AsesorConfig,
    mes: number,
    ano: number,
  ): Promise<ComisionAsesorRepuestoEntity | null> {
    const { nombre, sede } = asesor;

    switch (nombre) {
      case 'QUIÑONEZ NAVAS DIEGO ALONSO': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('QDIEGO', mes, ano);

        if (sede === 'MOSTRADOR') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataMos,
            comisionPorcentaje: 12,
            color: '#D8FFD4',
          });
        }

        if (sede === 'TALLER') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataTall,
            comisionPorcentaje: 8,
            color: '#D8FFD4',
          });
        }
        return null;
      }

      case 'CASTRO BLANCO LUIS EDUARDO': {
        const dataMos = await this.queryMostradorLuisE(nombre, mes, ano);
        return this.armarFilaDesdeRegistroUnico({
          nombre,
          sede,
          data: dataMos,
          comisionPorcentaje: 10,
          color: '#FEFEB7',
        });
      }

      case 'OLAYA CALDERON JOSE ALLENDY': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('JOLAYA', mes, ano);

        if (sede === 'MOSTRADOR-MAYOR') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataMos,
            comisionPorcentaje: 12,
            color: '#FECECE',
          });
        }

        if (sede === 'TALLER') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataTall,
            comisionPorcentaje: 4,
            color: '#FECECE',
          });
        }
        return null;
      }

      case 'CARRILLO ANGARITA FIDEL': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('FIDEL', mes, ano);
        return this.armarFilaCombinada({
          nombre,
          sede,
          dataMostrador: dataMos,
          dataTaller: dataTall,
          comisionPorcentaje: 4,
          comisionVentasPorcentaje: 0.0037,
          color: '#CED6FE',
        });
      }

      case 'RANGEL REYES CRISTIAN ORLANDO': {
        if (sede === 'CUCUTA MOSTRADOR') {
          const dataMos = await this.queryMostradorCr(nombre, mes, ano, false);
          const dataTall = await this.queryTallerCr('CRANGEL', mes, ano, false);
          return this.armarFilaCombinada({
            nombre,
            sede,
            dataMostrador: dataMos,
            dataTaller: dataTall,
            comisionPorcentaje: 7.5,
            comisionSobreUtilidad: true,
            color: '#CED6FE',
          });
        }

        if (sede === 'CUCUTA MOSTRADOR MULTIMARCAS') {
          const dataMos = await this.queryMostradorCr(nombre, mes, ano, true);
          const dataTall = await this.queryTallerCr('CRANGEL', mes, ano, true);
          return this.armarFilaCombinada({
            nombre,
            sede,
            dataMostrador: dataMos,
            dataTaller: dataTall,
            comisionPorcentaje: 4,
            comisionSobreUtilidad: false,
            color: '#CED6FE',
          });
        }
        return null;
      }

      case 'CHAPARRO HIGUERA YESLLY KARINA': {
        if (sede === 'TUNJA MOSTRADOR') {
          const dataMos = await this.queryMostradorYk(nombre, mes, ano, false);
          const dataTall = await this.queryTallerYk(
            'YCHAPARRO',
            mes,
            ano,
            false,
          );
          return this.armarFilaCombinada({
            nombre,
            sede,
            dataMostrador: dataMos,
            dataTaller: dataTall,
            comisionPorcentaje: 7.5,
            comisionSobreUtilidad: true,
            color: '#CED6FE',
          });
        }

        if (sede === 'TUNJA MOSTRADOR MULTIMARCAS') {
          const dataMos = await this.queryMostradorYk(nombre, mes, ano, true);
          const dataTall = await this.queryTallerYk(
            'YCHAPARRO',
            mes,
            ano,
            true,
          );
          return this.armarFilaCombinada({
            nombre,
            sede,
            dataMostrador: dataMos,
            dataTaller: dataTall,
            comisionPorcentaje: 4,
            comisionSobreUtilidad: false,
            color: '#CED6FE',
          });
        }
        return null;
      }

      case 'LOPEZ JUAN MANUEL': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('JMANUEL', mes, ano);
        return this.armarFilaCombinada({
          nombre,
          sede,
          dataMostrador: dataMos,
          dataTaller: dataTall,
          comisionPorcentaje: 2,
          comisionSobreUtilidad: true,
          color: '#CED6FE',
        });
      }

      case 'CADENA RAMIREZ FERNANDO ANTONIO': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('FERNANDO', mes, ano);
        return this.armarFilaCombinada({
          nombre,
          sede,
          dataMostrador: dataMos,
          dataTaller: dataTall,
          comisionPorcentaje: 4,
          comisionVentasPorcentaje: 0.0037,
          color: '#CEFEF8',
        });
      }

      case 'ABRIL RAMIREZ LEONARDO': {
        const dataLub = await this.queryMostradorAbril(mes, ano);
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTallM = await this.queryTallerBase('M-ABRIL', mes, ano);
        const dataTall = await this.queryTallerBase('LEONARDO', mes, ano);

        const ventaNeta =
          dataLub.ventaNeta +
          dataMos.ventaNeta +
          dataTall.ventaNeta +
          dataTallM.ventaNeta;
        const utilidad =
          dataLub.utilidad +
          dataMos.utilidad +
          dataTall.utilidad +
          dataTallM.utilidad;
        const margenBruto = ventaNeta !== 0 ? (utilidad / ventaNeta) * 100 : 0;
        const comisionPorcentaje = 2;
        const valorComision = utilidad * (comisionPorcentaje / 100);

        return new ComisionAsesorRepuestoEntity({
          nombre,
          sede,
          ventaNeta,
          margenBruto,
          utilidadBruta: utilidad,
          comisionPorcentaje,
          valorComision,
          comisionVentasPorcentaje: 0,
          valorComisionVentas: 0,
          totalComision: valorComision,
          color: '#CEFEF8',
        });
      }

      case 'ARDILA SANCHEZ JOSUE': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('JARDILA', mes, ano);

        if (sede === 'GIRON MOSTRADOR') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataMos,
            comisionPorcentaje: 7.5,
            color: '#CEFEF8',
          });
        }

        if (sede === 'GIRON ASEGURADORA-TALLER') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataTall,
            comisionPorcentaje: 3.5,
            color: '#CEFEF8',
          });
        }
        return null;
      }

      case 'VILLAMIZAR CASTILLO CAMILO ANDRES': {
        const dataMos = await this.queryMostradorSinMayor(nombre, mes, ano);
        const dataMayor = await this.queryMostradorMayor(nombre, mes, ano);
        const dataAceite = await this.queryMostradorAceite(nombre, mes, ano);

        if (sede === 'CHEVROPARTES MAYOR') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataMayor,
            comisionPorcentaje: 0,
            comisionVentasPorcentaje: 0.006,
            color: '#FACEFE',
          });
        }

        if (sede === 'CHEVROPARTES MOSTRADOR') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataMos,
            comisionPorcentaje: 10,
            color: '#FACEFE',
          });
        }

        if (sede === 'CHEVROPARTES ACEITE GRANEL') {
          return this.armarFilaDesdeRegistroUnico({
            nombre,
            sede,
            data: dataAceite,
            comisionPorcentaje: 0,
            comisionVentasPorcentaje: 0.004,
            color: '#FACEFE',
          });
        }
        return null;
      }

      case 'MEJIA VARGAS OSCAR ALFONSO': {
        const dataMos = await this.queryMostradorBase(nombre, mes, ano);
        const dataTall = await this.queryTallerBase('OMEJIA', mes, ano);
        return this.armarFilaCombinada({
          nombre,
          sede,
          dataMostrador: dataMos,
          dataTaller: dataTall,
          comisionPorcentaje: 12,
          comisionVentasPorcentaje: 0.01,
          color: '#CEFEF8',
        });
      }

      default:
        return null;
    }
  }

  private armarFilaDesdeRegistroUnico(params: {
    nombre: string;
    sede: string;
    data: { ventaNeta: number; utilidad: number; margen: number };
    comisionPorcentaje: number;
    comisionVentasPorcentaje?: number;
    color: string;
  }): ComisionAsesorRepuestoEntity {
    const {
      nombre,
      sede,
      data,
      comisionPorcentaje,
      comisionVentasPorcentaje = 0,
      color,
    } = params;

    const utilidadBruta = data.ventaNeta * (data.margen / 100);
    const valorComision =
      comisionPorcentaje > 0 ? utilidadBruta * (comisionPorcentaje / 100) : 0;
    const valorComisionVentas = data.ventaNeta * comisionVentasPorcentaje;
    const totalComision = valorComision + valorComisionVentas;

    return new ComisionAsesorRepuestoEntity({
      nombre,
      sede,
      ventaNeta: data.ventaNeta,
      margenBruto: data.margen,
      utilidadBruta,
      comisionPorcentaje,
      valorComision,
      comisionVentasPorcentaje,
      valorComisionVentas,
      totalComision,
      color,
    });
  }

  private armarFilaCombinada(params: {
    nombre: string;
    sede: string;
    dataMostrador: { ventaNeta: number; utilidad: number; margen: number };
    dataTaller: { ventaNeta: number; utilidad: number; margen: number };
    comisionPorcentaje: number;
    comisionVentasPorcentaje?: number;
    comisionSobreUtilidad?: boolean;
    color: string;
  }): ComisionAsesorRepuestoEntity {
    const {
      nombre,
      sede,
      dataMostrador,
      dataTaller,
      comisionPorcentaje,
      comisionVentasPorcentaje = 0,
      comisionSobreUtilidad = true,
      color,
    } = params;

    const ventaNeta = dataMostrador.ventaNeta + dataTaller.ventaNeta;
    const utilidad = dataMostrador.utilidad + dataTaller.utilidad;
    const margenBruto = ventaNeta !== 0 ? (utilidad / ventaNeta) * 100 : 0;
    const utilidadBruta = ventaNeta * (margenBruto / 100);
    const baseComision = comisionSobreUtilidad ? utilidadBruta : ventaNeta;
    const valorComision = baseComision * (comisionPorcentaje / 100);
    const valorComisionVentas = ventaNeta * comisionVentasPorcentaje;
    const totalComision = valorComision + valorComisionVentas;

    return new ComisionAsesorRepuestoEntity({
      nombre,
      sede,
      ventaNeta,
      margenBruto,
      utilidadBruta,
      comisionPorcentaje,
      valorComision,
      comisionVentasPorcentaje,
      valorComisionVentas,
      totalComision,
      color,
    });
  }

  private async queryMostradorBase(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<{
    subtotal: number;
    descuento: number;
    ventaNeta: number;
    costoNeto: number;
    utilidad: number;
    margen: number;
  }> {
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: true,
    });
  }

  private async queryMostradorLuisE(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<TotalesComisionData> {
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: false,
    });
  }

  private async queryMostradorCr(
    nombre: string,
    mes: number,
    ano: number,
    multimarcas: boolean,
  ): Promise<TotalesComisionData> {
    const bodegas = [611, 613, 511, 513];
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: true,
      bodegaMode: multimarcas ? 'IN' : 'NOT_IN',
      bodegas,
    });
  }

  private async queryMostradorYk(
    nombre: string,
    mes: number,
    ano: number,
    multimarcas: boolean,
  ): Promise<TotalesComisionData> {
    const bodegas = [606, 608, 506, 508];
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: true,
      bodegaMode: multimarcas ? 'IN' : 'NOT_IN',
      bodegas,
    });
  }

  private async queryMostradorSinMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<TotalesComisionData> {
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: true,
      usuarioLike: 'NOT_MAYOR',
    });
  }

  private async queryMostradorMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<TotalesComisionData> {
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: true,
      usuarioLike: 'MAYOR',
    });
  }

  private async queryMostradorAceite(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<TotalesComisionData> {
    return this.queryMostrador(mes, ano, {
      vendedor: nombre,
      includeTipoVentaMostrador: true,
      contable: 105,
    });
  }

  private async queryMostradorAbril(
    mes: number,
    ano: number,
  ): Promise<TotalesComisionData> {
    return this.queryMostrador(mes, ano, {
      includeTipoVentaMostrador: false,
      tipoIn: ['LUB', 'DLU'],
      bodegaEq: 1,
    });
  }

  private async queryMostrador(
    mes: number,
    ano: number,
    options: {
      vendedor?: string;
      includeTipoVentaMostrador: boolean;
      bodegaMode?: 'IN' | 'NOT_IN';
      bodegas?: number[];
      usuarioLike?: 'MAYOR' | 'NOT_MAYOR';
      contable?: number;
      tipoIn?: string[];
      bodegaEq?: number;
    },
  ): Promise<TotalesComisionData> {
    const whereParts: Prisma.Sql[] = [
      Prisma.sql`ano = ${ano}`,
      Prisma.sql`mes = ${mes}`,
    ];

    if (options.includeTipoVentaMostrador) {
      whereParts.push(Prisma.sql`tipo_venta = 'MOSTRADOR'`);
    }
    if (options.vendedor) {
      whereParts.push(Prisma.sql`vendedor_detalle = ${options.vendedor}`);
    }
    if (options.usuarioLike === 'MAYOR') {
      whereParts.push(Prisma.sql`usuario LIKE 'M-%'`);
    }
    if (options.usuarioLike === 'NOT_MAYOR') {
      whereParts.push(Prisma.sql`usuario NOT LIKE 'M-%'`);
    }
    if (options.contable != null) {
      whereParts.push(Prisma.sql`contable = ${options.contable}`);
    }
    if (options.tipoIn && options.tipoIn.length > 0) {
      whereParts.push(Prisma.sql`tipo IN (${Prisma.join(options.tipoIn)})`);
    }
    if (options.bodegaEq != null) {
      whereParts.push(Prisma.sql`bodega = ${options.bodegaEq}`);
    }
    if (options.bodegaMode && options.bodegas && options.bodegas.length > 0) {
      whereParts.push(
        options.bodegaMode === 'IN'
          ? Prisma.sql`bodega IN (${Prisma.join(options.bodegas)})`
          : Prisma.sql`bodega NOT IN (${Prisma.join(options.bodegas)})`,
      );
    }

    const rows = await this.prisma.$queryRaw<AggregationRow[]>(Prisma.sql`
      SELECT
        SUM(CONVERT(money, subtotal)) AS subtotal,
        SUM(CONVERT(money, descuento)) AS descuento,
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, costo)) AS costo_neto,
        SUM(CONVERT(money, [Subtotal-Descuento]-costo)) AS utilidad,
        CASE
          WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          ELSE CONVERT(decimal(10,2), (SUM([Subtotal-Descuento]-costo) / SUM([Subtotal-Descuento])) * 100)
        END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ${Prisma.join(whereParts, ' AND ')}
    `);

    return this.normalizeAggregationRow(rows[0]);
  }

  private async queryTallerBase(
    usuario: string,
    mes: number,
    ano: number,
  ): Promise<{
    subtotal: number;
    descuento: number;
    ventaNeta: number;
    costoNeto: number;
    utilidad: number;
    margen: number;
  }> {
    return this.queryTaller(usuario, mes, ano, {});
  }

  private async queryTallerCr(
    usuario: string,
    mes: number,
    ano: number,
    multimarcas: boolean,
  ): Promise<TotalesComisionData> {
    const bodegas = [611, 613, 511, 513];
    return this.queryTaller(usuario, mes, ano, {
      bodegaMode: multimarcas ? 'IN' : 'NOT_IN',
      bodegas,
    });
  }

  private async queryTallerYk(
    usuario: string,
    mes: number,
    ano: number,
    multimarcas: boolean,
  ): Promise<TotalesComisionData> {
    const bodegas = [606, 608, 506, 508];
    return this.queryTaller(usuario, mes, ano, {
      bodegaMode: multimarcas ? 'IN' : 'NOT_IN',
      bodegas,
    });
  }

  private async queryTaller(
    usuario: string,
    mes: number,
    ano: number,
    options: { bodegaMode?: 'IN' | 'NOT_IN'; bodegas?: number[] },
  ): Promise<TotalesComisionData> {
    const bodegaClause =
      options.bodegaMode && options.bodegas && options.bodegas.length > 0
        ? options.bodegaMode === 'IN'
          ? Prisma.sql`AND bodega IN (${Prisma.join(options.bodegas)})`
          : Prisma.sql`AND bodega NOT IN (${Prisma.join(options.bodegas)})`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<AggregationRow[]>(Prisma.sql`
      SELECT
        SUM(CONVERT(money, subtotal)) AS subtotal,
        SUM(CONVERT(money, descuento)) AS descuento,
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, costo)) AS costo_neto,
        SUM(CONVERT(money, [Subtotal-Descuento]-costo)) AS utilidad,
        CASE
          WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          ELSE CONVERT(decimal(10,2), (SUM([Subtotal-Descuento]-costo) / SUM([Subtotal-Descuento])) * 100)
        END AS margen
      FROM v_rep_base_nomina_AMDR_base_usuarios_traslados
      WHERE ano = ${ano}
        AND mes = ${mes}
        AND tipo_venta = 'TALLER'
        AND usuario <> 'CRANGEL'
        AND usuario = ${usuario}
        ${bodegaClause}
      UNION ALL
      SELECT
        SUM(CONVERT(money, subtotal)) AS subtotal,
        SUM(CONVERT(money, descuento)) AS descuento,
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, costo)) AS costo_neto,
        SUM(CONVERT(money, [Subtotal-Descuento]-costo)) AS utilidad,
        CASE
          WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          ELSE CONVERT(decimal(10,2), (SUM([Subtotal-Descuento]-costo) / SUM([Subtotal-Descuento])) * 100)
        END AS margen
      FROM v_rep_base_nomina_AMDR_base_usuarios_traslados
      WHERE ano = ${ano}
        AND mes = ${mes}
        AND tipo_venta = 'TALLER'
        AND usuario = 'CRANGEL'
        AND des_contable <> 'ACCESORIOS'
        AND usuario = ${usuario}
        ${bodegaClause}
    `);

    let ventaNeta = 0;
    let subtotal = 0;
    let descuento = 0;
    let costoNeto = 0;
    let utilidad = 0;
    for (const row of rows) {
      subtotal += Number(row.subtotal ?? 0);
      descuento += Number(row.descuento ?? 0);
      ventaNeta += Number(row.venta_neta ?? 0);
      costoNeto += Number(row.costo_neto ?? 0);
      utilidad += Number(row.utilidad ?? 0);
    }

    const margen = ventaNeta !== 0 ? (utilidad / ventaNeta) * 100 : 0;
    return { subtotal, descuento, ventaNeta, costoNeto, utilidad, margen };
  }

  private normalizeAggregationRow(row?: AggregationRow): {
    subtotal: number;
    descuento: number;
    ventaNeta: number;
    costoNeto: number;
    utilidad: number;
    margen: number;
  } {
    return {
      subtotal: Number(row?.subtotal ?? 0),
      descuento: Number(row?.descuento ?? 0),
      ventaNeta: Number(row?.venta_neta ?? 0),
      costoNeto: Number(row?.costo_neto ?? 0),
      utilidad: Number(row?.utilidad ?? 0),
      margen: Number(row?.margen ?? 0),
    };
  }
}
