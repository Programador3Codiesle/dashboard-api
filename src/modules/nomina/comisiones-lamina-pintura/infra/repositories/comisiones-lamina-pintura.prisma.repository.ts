import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosComisionesLaminaPintura,
  FiltrosDetalleComisionLaminaPintura,
  FiltrosTotalRepuestosSede,
  IComisionesLaminaPinturaRepository,
} from '../../domain/comisiones-lamina-pintura.repository';
import {
  ComisionLaminaPinturaEntity,
  DetalleComisionLaminaPinturaEntity,
  TotalRepuestosSedeEntity,
} from '../../domain/comisiones-lamina-pintura.entity';

type RawLyp = {
  operario: number;
  nombres: string;
  descripcion: string;
  productividad: number;
  horas_trabajadas: number;
  horas_productivas_mes: number;
  porcentaje_liquidacion: number;
  materiales: number;
  base_comision_mo: number;
  internas: number;
  comsion_sin_internas_mo: number;
  Base_Rptos: number;
  porc_fac_total: number;
  vidrios: number;
  pulidas_livianos: number | null;
  pulidas_pesados: number | null;
  Bono_NPS: number;
};

type RawDetalle = {
  tipo: string;
  numero: number;
  numero_orden: number;
  placa: string;
  vehiculo: string;
  productividad: number;
  porc_liquida: number;
  tiempo_facturado: number;
  base_comision: number;
  materiales: number;
  internas: number;
  Comision_a_pagar: number;
};

@Injectable()
export class ComisionesLaminaPinturaPrismaRepository
  implements IComisionesLaminaPinturaRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosComisionesLaminaPintura,
  ): Promise<ComisionLaminaPinturaEntity[]> {
    const { desde, hasta, perfilUsuario, nitUsuarioSesion } = filtros;
    if (perfilUsuario !== 1 && perfilUsuario !== 20 && perfilUsuario !== 24) {
      throw new ForbiddenException('No tiene permisos para ver este Informe');
    }

    const filtroOperario =
      perfilUsuario === 24 && nitUsuarioSesion
        ? Prisma.sql`AND a.operario = ${nitUsuarioSesion}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RawLyp[]>(Prisma.sql`
      SELECT
        a.operario,
        a.nombres,
        t.descripcion,
        productividad=convert(decimal(18,2),(SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))*100),
        horas_trabajadas=SUM(tiempo_facturado),
        horas_productivas_mes=(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})),
        porcentaje_liquidacion=case when a.concepto='4' then '20'
          when a.concepto='5' then '60'
          when a.concepto in ('7','8') then '24'
          when a.concepto=18 then '0'
          when a.concepto='9' and (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=4000000 then '20'
          when a.concepto='9' and (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=5000000 then '22'
          when a.concepto='9' and (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=7000000 then '24'
          when a.concepto='9' and (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=9000000 then '26'
          when a.concepto='9' and (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=11000000 then '29'
          when a.concepto='9' and (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))>11000000 then '31'
          when a.concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.4 then '23'
          when a.concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.5 then '24'
          when a.concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.6 then '25'
          when a.concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))>1.6 then '26' else 0 end,
        materiales=sum(materiales),
        base_comision_mo=case when a.concepto=18 then 0 when a.concepto<>'9' then convert(int,(sum(a.facturado)+SUM(fact_pulido))) else convert(int,(sum(a.facturado)+SUM(internas)+SUM(fact_pulido))) end,
        internas=case when a.concepto=18 then 0 else sum(internas) end,
        comsion_sin_internas_mo=case when a.concepto='4' then convert(int,((sum(a.facturado)+SUM(fact_pulido))*0.2)+(sum(materiales)*0.04))
          when a.concepto='5' and operario<>1094044354 then convert(int,((sum(a.facturado)+SUM(fact_pulido))*0.6))
          when a.concepto in ('7','8') then convert(int,((sum(a.facturado)+SUM(fact_pulido))*0.24))
          when a.concepto=18 and i.patio=9 then 1*(CASE WHEN SUM(tiempo_facturado) BETWEEN 1 AND 50 THEN 200000 WHEN SUM(tiempo_facturado) BETWEEN 50.01 AND 80 THEN 300000 WHEN SUM(tiempo_facturado)>=80.01 THEN 500000 ELSE 0 END)
          when a.concepto=18 and i.patio=2 then 1*(CASE WHEN SUM(tiempo_facturado) BETWEEN 1 AND 50 THEN 1200000 WHEN SUM(tiempo_facturado) BETWEEN 50.01 AND 80 THEN 1600000 WHEN SUM(tiempo_facturado)>=80.01 THEN 1800000 ELSE 0 END)
          when a.concepto='9' and operario<>88246790 then (CONVERT(int,(sum(a.facturado)+SUM(internas)+SUM(fact_pulido))*case when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=4000000 then 0.20 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=5000000 then 0.22 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=7000000 then 0.24 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=9000000 then 0.26 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=11000000 then 0.29 else 0.31 end))
          when operario=88246790 then ((CONVERT(int,(sum(a.facturado)+SUM(internas))*case when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=4000000 then 0.20 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=5000000 then 0.22 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=7000000 then 0.24 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=9000000 then 0.26 when (SUM(a.facturado)+SUM(internas)+SUM(fact_pulido))<=11000000 then 0.29 else 0.31 end))+(CONVERT(int,(sum(fact_pulido))*0.6))+(sum(materiales)*0.04))
          when a.operario not in (1093140589,1094044354) then (CONVERT(int,(sum(a.facturado+a.fact_pulido))*case when (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.4 then 0.23 when (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.5 then 0.24 when (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.6 then 0.25 else 0.26 end))
          when a.operario in (1093140589,1094044354) then ((CONVERT(int,(sum(a.facturado))*case when (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.4 then 0.23 when (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.5 then 0.24 when (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where CONVERT(DATE,fecha) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.6 then 0.25 else 0.26 end))+(CONVERT(int,(sum(fact_pulido))*0.6)))
          else 0 end,
        Base_Rptos=case when a.operario = 7214506 then 0
          when a.concepto=18 then 0
          when o.patio=2 then convert(int,(select SUM(valor_niif)*-1 from movimiento where centro in (33,45) and tipo<>'Z1' and (cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%') and YEAR(CONVERT(DATE,fec)) = YEAR(CONVERT(DATE,${desde}))AND MONTH(CONVERT(DATE,fec)) = MONTH(CONVERT(DATE,${desde})))*0.01)
          else convert(int,(select SUM(valor_niif)*-1 from movimiento where centro in (31,46) and tipo<>'Z1' and (cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%') and YEAR(CONVERT(DATE,fec)) = YEAR(CONVERT(DATE,${desde})) AND MONTH(CONVERT(DATE,fec)) = MONTH(CONVERT(DATE,${desde})))*0.02) end,
        porc_fac_total=case when a.operario = 7214506 then 0
          when a.concepto=18 then 0
          else convert(decimal(18,2),(SUM(facturado)+SUM(fact_pulido))/(case when o.patio=2 and a.operario != 7214506 then convert(decimal(18,2),(select (SUM(facturado)+SUM(fact_pulido)) from v_comisiones_lyp x inner join tall_operarios y on x.operario=y.nit where y.patio=2 and x.operario != 7214506 and CONVERT(DATE,x.fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))
          else convert(decimal(18,2),(select SUM(facturado+fact_pulido) from v_comisiones_lyp x inner join tall_operarios y on x.operario=y.nit where y.patio=9 and CONVERT(DATE,x.fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta}))) end)*100) end,
        vidrios=SUM(vidrios),
        pl.cantidad as pulidas_livianos,
        pp.cantidad as pulidas_pesados,
        isnull(bn.bono_nps,0) as Bono_NPS
      from v_comisiones_lyp a
      inner join v_cod_tall_calendario_produccion b on a.ano=b.ano and a.mes=b.mes
      inner join tall_operarios o on a.operario=o.nit
      inner join terceros_12 t on a.concepto=t.concepto_12
      inner join tall_operarios_intranet i on a.operario=i.nit
      inner join postv_bono_nps_tecnicos bn on a.operario=bn.nit and bn.ano=YEAR(CONVERT(DATE,${desde})) and bn.mes=month(CONVERT(DATE,${desde}))
      LEFT JOIN (SELECT pulidor,cantidad=SUM(cant) FROM (SELECT distinct operario as pulidor,numero_orden,cant=case when sw=1 and dl.numero_orden not in (select numero_orden from tall_documentos_lin where CONVERT(DATE,fec)<CONVERT(DATE,${desde}) and clase_trabajo='C' and operacion in ('40111PULIDOR','40011PULIDOR','40711PULIDOR')) and clase_trabajo='C' then 1 when sw=2 and clase_trabajo='C' then -1 else 0 end FROM tall_documentos_lin dl INNER JOIN terceros t ON dl.operario=t.nit where CONVERT(DATE,fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta}) and operacion in ('40111PULIDOR','40011PULIDOR','40711PULIDOR') and t.concepto_12=5 and clase_trabajo='C') a GROUP BY pulidor) pl ON a.operario=pl.pulidor
      LEFT JOIN (SELECT pulidor,cantidad=SUM(cant) FROM (SELECT distinct operario as pulidor,numero_orden,cant=case when sw=1 and dl.numero_orden not in (select numero_orden from tall_documentos_lin where CONVERT(DATE,fec)<CONVERT(DATE,${desde}) and clase_trabajo='C' and operacion in ('40111PULIDOR','40011PULIDOR','40711PULIDOR')) and clase_trabajo='C' then 1 when sw=2 and clase_trabajo='C' then -1 else 0 end FROM tall_documentos_lin dl INNER JOIN terceros t ON dl.operario=t.nit where CONVERT(DATE,fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta}) and operacion in ('50011PULIDOR','50711PULIDOR') and t.concepto_12=5 and clase_trabajo='C') a GROUP BY pulidor) pp ON a.operario=pp.pulidor
      where CONVERT(DATE,fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})
      ${filtroOperario}
      group by a.operario, a.nombres, a.concepto,i.patio, t.descripcion,o.patio,bn.bono_nps,pl.cantidad,pp.cantidad
      order by i.patio,nombres
    `);

    return rows.map((row) => {
      const pulidasLivianos = Number(row.pulidas_livianos ?? 0);
      const pulidasPesados = Number(row.pulidas_pesados ?? 0);
      const totalPulidoLivianos = pulidasLivianos * 10000;
      const totalPulidoPesados = pulidasPesados * 15000;
      const baseRepuestos = Number(row.Base_Rptos ?? 0);
      const porcFacTotal = Number(row.porc_fac_total ?? 0);
      const comisionRepuestos = baseRepuestos * (porcFacTotal / 100);
      const totalPagar =
        Number(row.comsion_sin_internas_mo ?? 0) +
        comisionRepuestos +
        Number(row.Bono_NPS ?? 0) +
        Number(row.internas ?? 0) +
        Number(row.vidrios ?? 0) +
        totalPulidoLivianos +
        totalPulidoPesados;

      return new ComisionLaminaPinturaEntity({
        operario: String(row.operario),
        nombres: row.nombres,
        descripcion: row.descripcion,
        productividad: Number(row.productividad ?? 0),
        horasTrabajadas: Number(row.horas_trabajadas ?? 0),
        horasProductivasMes: Number(row.horas_productivas_mes ?? 0),
        porcentajeLiquidacion: Number(row.porcentaje_liquidacion ?? 0),
        materiales: Number(row.materiales ?? 0),
        baseComisionMo: Number(row.base_comision_mo ?? 0),
        internas: Number(row.internas ?? 0),
        comisionSinInternasMo: Number(row.comsion_sin_internas_mo ?? 0),
        baseRepuestos,
        porcFacTotal,
        comisionRepuestos,
        pulidasLivianos,
        totalPulidoLivianos,
        pulidasPesados,
        totalPulidoPesados,
        vidrios: Number(row.vidrios ?? 0),
        bonoNps: Number(row.Bono_NPS ?? 0),
        totalPagar,
      });
    });
  }

  async obtenerDetalle(
    filtros: FiltrosDetalleComisionLaminaPintura,
  ): Promise<DetalleComisionLaminaPinturaEntity[]> {
    const { desde, hasta, nit } = filtros;
    const rows = await this.prisma.$queryRaw<RawDetalle[]>(Prisma.sql`
      select a.tipo, a.numero, dl.numero as numero_orden, r.placa, f.descripcion as vehiculo,
      pro.productividad, (pro.porcentaje_liquidacion*100) as porc_liquida,
      a.tiempo_facturado,
      base_comision=case when a.concepto=18 THEN 0 when a.concepto<>'9' then convert(int,a.facturado+a.fact_pulido) else convert(int,(a.facturado+internas+a.fact_pulido)) end,
      materiales, internas=CASE WHEN a.concepto=18 THEN 0 ELSE internas end,
      Comision_a_pagar=case when a.concepto='4' then convert(int,(((a.facturado+a.fact_pulido)*0.2)+internas+(materiales*0.04)))
      when a.concepto='5' and a.operario <> 1094044354 then convert(int,((a.facturado+a.fact_pulido)*0.6)+internas)
      when a.concepto in ('7','8') then convert(int,((a.facturado+a.fact_pulido)*0.24)+internas)
      when a.concepto=18 then convert(int,((a.facturado+a.fact_pulido)*0))
      when a.concepto='9' and a.operario<>88246790 and convert(int,(a.facturado+internas+a.fact_pulido))=CONVERT(int,internas) then CONVERT(int,internas)
      when a.concepto='9' and a.operario<>88246790 and convert(int,(a.facturado+internas+a.fact_pulido))<>CONVERT(int,internas) then (CONVERT(int,(a.facturado+internas+a.fact_pulido)*porcentaje_liquidacion))+CONVERT(int,internas)
      when a.concepto='9' and a.operario=88246790 and convert(int,(a.facturado+internas+a.fact_pulido+materiales))=CONVERT(int,internas) then CONVERT(int,internas)
      when a.concepto='9' and a.operario=88246790 and convert(int,(a.facturado+internas+a.fact_pulido+materiales))<>CONVERT(int,internas) then (CONVERT(int,(a.facturado+internas)*porcentaje_liquidacion))+CONVERT(int,internas)+(CONVERT(int,fact_pulido)*0.6)+(CONVERT(int,materiales)*0.04)
      when a.concepto not in (5,7,8,9,18) then (CONVERT(int,(a.facturado+a.fact_pulido))*case when pro.productividad<=140 then 0.23 when pro.productividad<=150 then 0.24 when pro.productividad<=160 then 0.25 else 0.26 end)+(CONVERT(int,internas))
      when a.operario=1094044354 then ((CONVERT(int,a.facturado)*case when pro.productividad<=140 then 0.23 when pro.productividad<=150 then 0.24 when pro.productividad<=160 then 0.25 else 0.26 end)+(CONVERT(int,internas))+(CONVERT(int,(sum(fact_pulido))*0.6)))
      else 0 end
      FROM v_comisiones_lyp a
      inner join (select operario, productividad=convert(decimal(10,2),(SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where fecha between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))*100),
        porcentaje_liquidacion=case when concepto='4' then 0.2 when concepto='5' then 0.6 when concepto in ('7','8') then 0.24 when concepto=18 then 0
        when concepto='9' and (SUM(facturado)+SUM(internas)+SUM(fact_pulido))<=4000000 then 0.20 when concepto='9' and (SUM(facturado)+SUM(internas)+SUM(fact_pulido))<=5000000 then 0.22
        when concepto='9' and (SUM(facturado)+SUM(internas)+SUM(fact_pulido))<=7000000 then 0.24 when concepto='9' and (SUM(facturado)+SUM(internas)+SUM(fact_pulido))<=9000000 then 0.26
        when concepto='9' and (SUM(facturado)+SUM(internas)+SUM(fact_pulido))<=11000000 then 0.29 when concepto='9' and (SUM(facturado)+SUM(internas)+SUM(fact_pulido))>11000000 then 0.31
        when concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where fecha between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.40 then 0.23
        when concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where fecha between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.50 then 0.24
        when concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where fecha between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))<=1.60 then 0.25
        when concepto='6' and (SUM(tiempo_facturado)/(select sum(horas_produccion) from v_cod_tall_calendario where fecha between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})))>1.60 then 0.26 else 0 end
      from v_comisiones_lyp a inner join tall_operarios o on a.operario=o.nit
      where CONVERT(DATE,fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta})
      group by operario,concepto,o.patio)pro on a.operario=pro.operario
      inner join terceros_12 t on a.concepto=t.concepto_12
      inner join tall_operarios o on a.operario=o.nit
      inner join tall_encabeza_orden dl on a.numero_orden=dl.numero
      inner join v_vh_vehiculos r on dl.serie=r.codigo
      left join vh_modelo m on r.modelo=m.modelo
      left join vh_familias f on m.familia=f.familia
      where CONVERT(DATE,a.fec) between CONVERT(DATE,${desde}) and CONVERT(DATE,${hasta}) and a.operario=${nit}
      group by a.operario, a.nombres, a.concepto,o.patio, t.descripcion,pro.productividad,r.placa,dl.numero,a.tipo,a.numero,a.tiempo_facturado, porcentaje_liquidacion,materiales,internas,facturado,f.descripcion,fact_pulido
      order by a.nombres
    `);

    return rows.map(
      (row) =>
        new DetalleComisionLaminaPinturaEntity({
          factura: `${row.tipo} ${row.numero}`,
          numeroOrden: Number(row.numero_orden ?? 0),
          placa: row.placa,
          vehiculo: row.vehiculo,
          productividad: Number(row.productividad ?? 0),
          porcentajeLiquidacion: Number(row.porc_liquida ?? 0),
          tiempoFacturado: Number(row.tiempo_facturado ?? 0),
          baseComision: Number(row.base_comision ?? 0),
          materiales: Number(row.materiales ?? 0),
          internas: Number(row.internas ?? 0),
          comisionPagar: Number(row.Comision_a_pagar ?? 0),
        }),
    );
  }

  async obtenerTotalRepuestosSede(
    filtros: FiltrosTotalRepuestosSede,
  ): Promise<TotalRepuestosSedeEntity> {
    const { desde, sede } = filtros;

    const result = await this.prisma.$queryRaw<Array<{ Base_Rptos: number | null }>>(
      sede === 1
        ? Prisma.sql`
          select Base_Rptos=SUM(valor_niif)*-1 from movimiento
          where centro in (33,45) and (cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%') and tipo <> 'Z1'
          and YEAR(CONVERT(DATE,fec)) = YEAR(CONVERT(DATE,${desde})) AND MONTH(CONVERT(DATE,fec)) = MONTH(CONVERT(DATE,${desde}))
        `
        : Prisma.sql`
          select Base_Rptos=SUM(valor_niif)*-1 from movimiento
          where centro in (31,46) and tipo <> 'Z1'
          and (cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%')
          and YEAR(CONVERT(DATE,fec)) = YEAR(CONVERT(DATE,${desde}))
          AND MONTH(CONVERT(DATE,fec)) = MONTH(CONVERT(DATE,${desde}))
        `,
    );

    return new TotalRepuestosSedeEntity({
      sede,
      total: Number(result[0]?.Base_Rptos ?? 0),
    });
  }
}

