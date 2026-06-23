import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { IAsesorRepuestoDashboardRepository } from '../../domain/asesor-repuesto.repository';
import { DashboardAsesorRepDto } from '../../application/dto/dashboard-response.dto';
import { ASESORES } from '../../domain/dashboard.constants';

@Injectable()
export class AsesorRepuestoService {
  constructor(
    private readonly commonRepo: IDashboardCommonRepository,
    private readonly asesorRepo: IAsesorRepuestoDashboardRepository,
  ) {}

  async buildAsesorRep(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    idsede?: number,
    idEmpresa?: number,
  ): Promise<DashboardAsesorRepDto> {
    let sedesRows = await this.commonRepo.getSedesUser(
      nitUsuario,
      idEmpresa,
    );
    const sedesParaResponse = sedesRows.map((r) => ({
      idsede: r.idsede,
      idsede_v: r.idsede_v ?? String(r.idsede),
      descripcion: r.descripcion ?? `Sede ${r.idsede}`,
    }));
    if (sedesRows.length > 1) {
      if (idsede != null) {
        sedesRows = sedesRows.filter((r) => r.idsede === idsede);
      } else {
        sedesRows = sedesRows.slice(0, 1);
      }
    }
    const presupuestosSede: Array<{ sede: string; presupuesto: number }> = [];

    const date = await this.commonRepo.getMesAnoActual();
    const mes = date?.mes ?? new Date().getMonth() + 1;
    const ano = date?.ano ?? new Date().getFullYear();

    for (const row of sedesRows) {
      const filasPresupuesto = await this.commonRepo.getPresupuestoSede(
        ano,
        mes,
        row.idsede,
      );

      let presupuesto = 0;

      if (nitUsuario === 91233925 && filasPresupuesto.length > 0) {
        //cadena ramirez fernando antonio
        presupuesto = Number(filasPresupuesto[0].rptos_colision);
      } else if (nitUsuario === 13719442 && filasPresupuesto.length > 0) {
        //castro blanco luis eduardo
        presupuesto = Number(filasPresupuesto[0].mostrador);
      } else if (nitUsuario === 1098685926 && filasPresupuesto.length > 0) {
        //quiñonez navas diego alonso
        const rptos_mto_preventivo = Number(
          filasPresupuesto[0].rptos_mto_preventivo,
        );
        const rptos_mto_correctivo = Number(
          filasPresupuesto[0].rptos_mto_correctivo,
        );
        const rptos_garantia = Number(filasPresupuesto[0].rptos_garantia);
        const rptos_retorno = Number(filasPresupuesto[0].rptos_retorno);
        const rptos_colision = Number(filasPresupuesto[0].rptos_colision);
        const mostrador = Number(filasPresupuesto[0].mostrador);

        presupuesto =
          rptos_mto_preventivo +
          rptos_mto_correctivo +
          rptos_garantia +
          rptos_retorno +
          rptos_colision +
          mostrador;
      } else if (nitUsuario === 91354375 && filasPresupuesto.length > 0) {
        //abril ramirez leonardo
        const rptos_mto_preventivo = Number(
          filasPresupuesto[0].rptos_mto_preventivo,
        );
        const rptos_mto_correctivo = Number(
          filasPresupuesto[0].rptos_mto_correctivo,
        );
        const rptos_garantia = Number(filasPresupuesto[0].rptos_garantia);
        const rptos_retorno = Number(filasPresupuesto[0].rptos_retorno);
        const rptos_colision = Number(filasPresupuesto[0].rptos_colision);

        presupuesto =
          rptos_mto_preventivo +
          rptos_mto_correctivo +
          rptos_garantia +
          rptos_retorno +
          rptos_colision;
      } else if (nitUsuario === 91536848 && filasPresupuesto.length > 0) {
        //lopez juan manuel
        const rptos_mto_preventivo = Number(
          filasPresupuesto[0].rptos_mto_preventivo,
        );
        const rptos_mto_correctivo = Number(
          filasPresupuesto[0].rptos_mto_correctivo,
        );
        const rptos_garantia = Number(filasPresupuesto[0].rptos_garantia);
        const rptos_retorno = Number(filasPresupuesto[0].rptos_retorno);
        const rptos_colision = Number(filasPresupuesto[0].rptos_colision);
        const mostrador = Number(filasPresupuesto[0].mostrador);

        presupuesto =
          rptos_mto_preventivo +
          rptos_mto_correctivo +
          rptos_garantia +
          rptos_retorno +
          rptos_colision +
          mostrador;
      }

      if (presupuesto > 0) {
        presupuestosSede.push({
          sede: row.descripcion ?? `Sede ${row.idsede}`,
          presupuesto,
        });
      }
    }

    const nomUsu = sedesRows[0]?.nombres ?? '';

    const resumenActual: NonNullable<DashboardAsesorRepDto['resumen_actual']> =
      [];
    let totalVendidoGlobal = 0;

    for (const asesor of ASESORES) {
      if (asesor.nombre !== nomUsu) continue;

      // Buscar la sede real según la descripción del usuario; si no se encuentra, usar la sede del asesor.
      const sedeLabel =
        sedesRows[0]?.descripcion ?? `Sede ${sedesRows[0]?.idsede}`;
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
          sede: sedeLabel,
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
          if (sedeLabel2 === 'MOSTRADOR' && dataMos) {
            const ventaNeta = dataMos.venta_neta;
            const margen = dataMos.margen;
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
          } else if (sedeLabel2 === 'TALLER' && dataTall) {
            const ventaNeta = dataTall.venta_neta;
            const margen = dataTall.margen;
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
          const dataMos = await this.asesorRepo.getComisionRepMostradorLuisE(
            asesor.nombre,
            mes,
            ano,
          );
          if (dataMos) {
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
          }
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
          if (sedeLabel === 'MOSTRADOR-MAYOR' && dataMos) {
            const ventaNeta = dataMos.venta_neta;
            const margen = dataMos.margen;
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
          } else if (sedeLabel === 'TALLER' && dataTall) {
            const ventaNeta = dataTall.venta_neta;
            const margen = dataTall.margen;
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
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'FIDEL',
            mes,
            ano,
          );
          if (dataMos) {
            let ventaNeta = dataMos.venta_neta;
            let utilidad = dataMos.utilidad;
            if (dataTall) {
              ventaNeta += dataTall.venta_neta;
              utilidad += dataTall.utilidad;
            }
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
          }
          break;
        }
        case 'RANGEL REYES CRISTIAN ORLANDO': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'CRANGEL',
            mes,
            ano,
          );
          if (dataMos) {
            let ventaNeta = dataMos.venta_neta;
            let utilidad = dataMos.utilidad;
            if (dataTall) {
              ventaNeta += dataTall.venta_neta;
              utilidad += dataTall.utilidad;
            }
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
          }
          break;
        }
        case 'LOPEZ JUAN MANUEL': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'JMANUEL',
            mes,
            ano,
          );
          if (dataMos) {
            let ventaNeta = dataMos.venta_neta;
            let utilidad = dataMos.utilidad;
            if (dataTall) {
              ventaNeta += dataTall.venta_neta;
              utilidad += dataTall.utilidad;
            }
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
          }
          break;
        }
        case 'CADENA RAMIREZ FERNANDO ANTONIO': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'FERNANDO',
            mes,
            ano,
          );
          if (dataMos) {
            let ventaNeta = dataMos.venta_neta;
            let utilidad = dataMos.utilidad;
            if (dataTall) {
              ventaNeta += dataTall.venta_neta;
              utilidad += dataTall.utilidad;
            }
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
          }
          break;
        }
        case 'ABRIL RAMIREZ LEONARDO': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          const dataTallM = await this.asesorRepo.getComisionRepTaller(
            'M-ABRIL',
            mes,
            ano,
          );
          const dataTall = await this.asesorRepo.getComisionRepTaller(
            'LEONARDO',
            mes,
            ano,
          );
          if (dataMos) {
            let ventaNeta = dataMos.venta_neta;
            let utilidad = dataMos.utilidad;
            if (dataTall) {
              ventaNeta += dataTall.venta_neta;
              utilidad += dataTall.utilidad;
            }
            if (dataTallM) {
              ventaNeta += dataTallM.venta_neta;
              utilidad += dataTallM.utilidad;
            }
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
          }
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
          if (sedeLabel === 'GIRON MOSTRADOR' && dataMos) {
            const ventaNeta = dataMos.venta_neta;
            const margen = dataMos.margen;
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
          } else if (sedeLabel === 'GIRON ASEGURADORA-TALLER' && dataTall) {
            const ventaNeta = dataTall.venta_neta;
            const margen = dataTall.margen;
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
          const dataAceite =
            await this.asesorRepo.getComisionRepMostradosAceite(
              asesor.nombre,
              mes,
              ano,
            );
          if (sedeLabel === 'CHEVROPARTES MAYOR' && dataMayor) {
            const ventaNeta = dataMayor.venta_neta;
            const margen = dataMayor.margen;
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
          } else if (
            sedeLabel === 'CHEVROPARTES MOSTRADOR' &&
            dataMosSinMayor
          ) {
            const ventaNeta = dataMosSinMayor.venta_neta;
            const margen = dataMosSinMayor.margen;
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
          } else if (sedeLabel === 'CHEVROPARTES ACEITE GRANEL' && dataAceite) {
            const ventaNeta = dataAceite.venta_neta;
            const margen = dataAceite.margen;
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
          }
          break;
        }
        case 'MEJIA VARGAS OSCAR ALFONSO': {
          const dataMos = await this.asesorRepo.getComisionRepMostrador(
            asesor.nombre,
            mes,
            ano,
          );
          if (dataMos) {
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
          }
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
      presupuestos_sede:
        presupuestosSede.length > 0 ? presupuestosSede : undefined,
      resumen_actual: resumenActual.length > 0 ? resumenActual : undefined,
      total_vendido_global: totalVendidoGlobal || undefined,
    };
  }
}
