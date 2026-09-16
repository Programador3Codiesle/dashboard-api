import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { IAsesorRepuestoDashboardRepository } from '../../domain/asesor-repuesto.repository';
import { DashboardAsesorRepDto } from '../dto/dashboard-response.dto';
import { ASESORES } from '../../domain/dashboard.constants';
import type { ComisionRepRow } from '../../domain/dashboard.repository';

const COMISION_CERO: ComisionRepRow = {
  venta_neta: 0,
  utilidad: 0,
  margen: 0,
};

@Injectable()
export class AsesorRepuestoService {
  constructor(
    private readonly commonRepo: IDashboardCommonRepository,
    private readonly asesorRepo: IAsesorRepuestoDashboardRepository,
  ) {}

  private orZero(row: ComisionRepRow | null): ComisionRepRow {
    return row ?? COMISION_CERO;
  }

  async buildAsesorRep(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardAsesorRepDto> {
    // PHP no pinta un panel de presupuestos en el dashboard 34 (asesor_rep.php).
    const todasLasSedes = await this.commonRepo.getSedesUser(nitUsuario);
    const sedesParaResponse = todasLasSedes.map((r) => ({
      idsede: r.idsede,
      idsede_v: r.idsede_v ?? String(r.idsede),
      descripcion: r.descripcion ?? `Sede ${r.idsede}`,
    }));

    const date = await this.commonRepo.getMesAnoActual();
    const mes = date?.mes ?? new Date().getMonth() + 1;
    const ano = date?.ano ?? new Date().getFullYear();

    const nomUsu =
      (await this.asesorRepo.getNombresByNit(nitUsuario)) ??
      todasLasSedes[0]?.nombres ??
      '';

    const resumenActual: NonNullable<DashboardAsesorRepDto['resumen_actual']> =
      [];
    let totalVendidoGlobal = 0;

    for (const asesor of ASESORES) {
      if (asesor.nombre !== nomUsu) continue;

      const sedeBodega =
        todasLasSedes[0]?.descripcion ??
        `Sede ${todasLasSedes[0]?.idsede ?? ''}`;
      const sedeLabel2 = asesor.sede;

      const pushFila = (params: {
        ventaNeta: number;
        margenBruto: number;
        utilidadBruta: number;
        comision: number;
        valorComision: number;
        comisionVariable?: number;
        valorComisionVariable?: number;
      }) => {
        const {
          ventaNeta,
          margenBruto,
          utilidadBruta,
          comision,
          valorComision,
          comisionVariable,
          valorComisionVariable,
        } = params;
        totalVendidoGlobal += ventaNeta;
        resumenActual.push({
          nombre: asesor.nombre,
          sede: sedeBodega,
          sede_label2: sedeLabel2,
          venta_neta: ventaNeta,
          margen_bruto: margenBruto,
          utilidad_bruta: utilidadBruta,
          comision,
          valor_comision: valorComision,
          comision_variable: comisionVariable,
          valor_comision_variable: valorComisionVariable,
          total_comision: valorComision + (valorComisionVariable ?? 0),
        });
      };

      switch (asesor.nombre) {
        case 'QUIÑONEZ NAVAS DIEGO ALONSO': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'QDIEGO',
            mes,
            ano,
          );
          if (sedeLabel2 === 'MOSTRADOR') {
            const data = this.orZero(dataMos);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 12.0;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          } else if (sedeLabel2 === 'TALLER') {
            const data = this.orZero(dataTall);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 8.0;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          }
          break;
        }
        case 'CASTRO BLANCO LUIS EDUARDO': {
          const dataMos = this.orZero(
            await this.asesorRepo.getComisionRepMostradorLuisE(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const ventaNeta = dataMos.venta_neta;
          const margen = dataMos.margen;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 10.0;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: margen,
            utilidadBruta,
            comision,
            valorComision,
          });
          break;
        }
        case 'OLAYA CALDERON JOSE ALLENDY': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'JOLAYA',
            mes,
            ano,
          );
          if (sedeLabel2 === 'MOSTRADOR-MAYOR') {
            const data = this.orZero(dataMos);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 12.0;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          } else if (sedeLabel2 === 'TALLER') {
            const data = this.orZero(dataTall);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 4.0;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          }
          break;
        }
        case 'CARRILLO ANGARITA FIDEL': {
          const mos = this.orZero(
            await this.asesorRepo.getComisionRepMostrador(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const tall = this.orZero(
            await this.asesorRepo.getComisionRepTaller('FIDEL', mes, ano),
          );
          const ventaNeta = mos.venta_neta + tall.venta_neta;
          const utilidad = mos.utilidad + tall.utilidad;
          const margen = ventaNeta === 0 ? 0 : (utilidad / ventaNeta) * 100;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 4.0;
          const comisionV = 0.0037;
          const valorComisionV = ventaNeta * comisionV;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: Number(margen.toFixed(2)),
            utilidadBruta,
            comision,
            valorComision,
            comisionVariable: comisionV,
            valorComisionVariable: valorComisionV,
          });
          break;
        }
        case 'RANGEL REYES CRISTIAN ORLANDO': {
          const mos = this.orZero(
            await this.asesorRepo.getComisionRepMostrador(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const tall = this.orZero(
            await this.asesorRepo.getComisionRepTaller('CRANGEL', mes, ano),
          );
          const ventaNeta = mos.venta_neta + tall.venta_neta;
          const utilidad = mos.utilidad + tall.utilidad;
          const margen = ventaNeta === 0 ? 0 : (utilidad / ventaNeta) * 100;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 7.5;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: Number(margen.toFixed(2)),
            utilidadBruta,
            comision,
            valorComision,
          });
          break;
        }
        case 'LOPEZ JUAN MANUEL': {
          const mos = this.orZero(
            await this.asesorRepo.getComisionRepMostrador(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const tall = this.orZero(
            await this.asesorRepo.getComisionRepTaller('JMANUEL', mes, ano),
          );
          const ventaNeta = mos.venta_neta + tall.venta_neta;
          const utilidad = mos.utilidad + tall.utilidad;
          const margen = ventaNeta === 0 ? 0 : (utilidad / ventaNeta) * 100;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 2.0;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: Number(margen.toFixed(2)),
            utilidadBruta,
            comision,
            valorComision,
          });
          break;
        }
        case 'CADENA RAMIREZ FERNANDO ANTONIO': {
          const mos = this.orZero(
            await this.asesorRepo.getComisionRepMostrador(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const tall = this.orZero(
            await this.asesorRepo.getComisionRepTaller('FERNANDO', mes, ano),
          );
          const ventaNeta = mos.venta_neta + tall.venta_neta;
          const utilidad = mos.utilidad + tall.utilidad;
          const margen = ventaNeta === 0 ? 0 : (utilidad / ventaNeta) * 100;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 4.0;
          const comisionV = 0.0037;
          const valorComisionV = ventaNeta * comisionV;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: Number(margen.toFixed(2)),
            utilidadBruta,
            comision,
            valorComision,
            comisionVariable: comisionV,
            valorComisionVariable: valorComisionV,
          });
          break;
        }
        case 'ABRIL RAMIREZ LEONARDO': {
          const mos = this.orZero(
            await this.asesorRepo.getComisionRepMostrador(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const tallM = this.orZero(
            await this.asesorRepo.getComisionRepTaller('M-ABRIL', mes, ano),
          );
          const tall = this.orZero(
            await this.asesorRepo.getComisionRepTaller('LEONARDO', mes, ano),
          );
          const ventaNeta = mos.venta_neta + tall.venta_neta + tallM.venta_neta;
          const utilidad = mos.utilidad + tall.utilidad + tallM.utilidad;
          const margen = ventaNeta === 0 ? 0 : (utilidad / ventaNeta) * 100;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 2.0;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: Number(margen.toFixed(2)),
            utilidadBruta,
            comision,
            valorComision,
          });
          break;
        }
        case 'ARDILA SANCHEZ JOSUE': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'JARDILA',
            mes,
            ano,
          );
          if (sedeLabel2 === 'GIRON MOSTRADOR') {
            const data = this.orZero(dataMos);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 7.5;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          } else if (sedeLabel2 === 'GIRON ASEGURADORA-TALLER') {
            const data = this.orZero(dataTall);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 3.5;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          }
          break;
        }
        case 'OCHOA RUEDA JHON FREDDY': {
          const dataMosSinMayor =
            await this.asesorRepo.getComisionRepMostradorSinMayor(
              asesor.nombre,
              mes,
              ano,
            );
          const dataMayor = await this.asesorRepo.getComisionRepMostradosMayor(
            asesor.nombre,
            mes,
            ano,
          );
          if (sedeLabel2 === 'CHEVROPARTES MAYOR') {
            const data = this.orZero(dataMayor);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 0;
            const comisionV = 0.006;
            const valorComisionV = ventaNeta * comisionV;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
              comisionVariable: comisionV,
              valorComisionVariable: valorComisionV,
            });
          } else if (sedeLabel2 === 'CHEVROPARTES MOSTRADOR') {
            const data = this.orZero(dataMosSinMayor);
            const ventaNeta = data.venta_neta;
            const margen = data.margen;
            const utilidadBruta = ventaNeta * (margen / 100);
            const comision = 10.0;
            const valorComision = utilidadBruta * (comision / 100);
            pushFila({
              ventaNeta,
              margenBruto: margen,
              utilidadBruta,
              comision,
              valorComision,
            });
          }
          break;
        }
        case 'MEJIA VARGAS OSCAR ALFONSO': {
          const dataMos = this.orZero(
            await this.asesorRepo.getComisionRepMostrador(
              asesor.nombre,
              mes,
              ano,
            ),
          );
          const ventaNeta = dataMos.venta_neta;
          const margen = dataMos.margen;
          const utilidadBruta = ventaNeta * (margen / 100);
          const comision = 8.0;
          const comisionV = 0.004;
          const valorComisionV = ventaNeta * comisionV;
          const valorComision = utilidadBruta * (comision / 100);
          pushFila({
            ventaNeta,
            margenBruto: margen,
            utilidadBruta,
            comision,
            valorComision,
            comisionVariable: comisionV,
            valorComisionVariable: valorComisionV,
          });
          break;
        }
        default:
          break;
      }
    }

    return {
      variant: 'asesor_rep',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      sedes: sedesParaResponse,
      resumen_actual: resumenActual.length > 0 ? resumenActual : undefined,
      total_vendido_global: totalVendidoGlobal || undefined,
    };
  }
}
