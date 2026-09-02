import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosComisionesTecnicos,
  FiltrosDetalleComisionesTecnicos,
  IComisionesTecnicosRepository,
} from '../../domain/comisiones-tecnicos.repository';
import {
  ComisionTecnicoEntity,
  DetalleComisionTecnicoEntity,
} from '../../domain/comisiones-tecnicos.entity';
import { PERFILES_COMISIONES_TECNICOS_FILTRO_NIT } from '../../domain/comisiones-tecnicos.constants';
import { perfilEn } from '../../../shared/perfil';

type RawComision = {
  nit: number;
  tecnico: string;
  patio: string;
  cargo: string;
  venta_repuestos: number;
  venta_mano_obra: number;
  comision_repuestos: number;
  comision_mano_obra: number;
  segunda_entrega: number;
  bono_NPS: number;
  Instalacion_accesorios: number;
  internas: number;
  alineaciones: number;
  balanceos: number;
};

type RawDetalle = {
  tipo: string;
  numero: number;
  numero_orden: number;
  placa: string;
  vh: string;
  operacion: string;
  nombre_operacion: string;
  venta_repuestos: number;
  venta_mano_obra: number;
  segunda_entrega: number;
  Instalacion_accesorios: number;
  internas: number;
};

@Injectable()
export class ComisionesTecnicosPrismaRepository implements IComisionesTecnicosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosComisionesTecnicos,
  ): Promise<ComisionTecnicoEntity[]> {
    const { mes, ano, perfilUsuario, nitUsuarioSesion } = filtros;
    const mesDate = `${ano}-${String(mes).padStart(2, '0')}-01`;
    if (mesDate < '2022-04-01') {
      throw new BadRequestException('No se puede cargar esta fecha');
    }

    const nitWhere =
      perfilEn(perfilUsuario, PERFILES_COMISIONES_TECNICOS_FILTRO_NIT) &&
      nitUsuarioSesion
        ? Prisma.sql`AND nit = ${nitUsuarioSesion}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RawComision[]>(Prisma.sql`
      SELECT *
      FROM v_comisiones_tecnicos_intranet
      WHERE año = ${ano} AND Mes = ${mes}
      ${nitWhere}
    `);

    return rows.map((row) => {
      const total =
        Number(row.comision_repuestos ?? 0) +
        Number(row.comision_mano_obra ?? 0) +
        Number(row.bono_NPS ?? 0) +
        Number(row.segunda_entrega ?? 0) +
        Number(row.Instalacion_accesorios ?? 0) +
        Number(row.internas ?? 0) +
        Number(row.alineaciones ?? 0) +
        Number(row.balanceos ?? 0);

      return new ComisionTecnicoEntity({
        nit: String(row.nit),
        tecnico: row.tecnico,
        patio: row.patio,
        cargo: row.cargo,
        ventaRepuestos: Number(row.venta_repuestos ?? 0),
        ventaManoObra: Number(row.venta_mano_obra ?? 0),
        comisionRepuestos: Number(row.comision_repuestos ?? 0),
        comisionManoObra: Number(row.comision_mano_obra ?? 0),
        segundaEntrega: Number(row.segunda_entrega ?? 0),
        bonoNps: Number(row.bono_NPS ?? 0),
        instalacionAccesorios: Number(row.Instalacion_accesorios ?? 0),
        internas: Number(row.internas ?? 0),
        alineaciones: Number(row.alineaciones ?? 0),
        balanceos: Number(row.balanceos ?? 0),
        total,
      });
    });
  }

  async detalle(
    filtros: FiltrosDetalleComisionesTecnicos,
  ): Promise<DetalleComisionTecnicoEntity[]> {
    const { mes, ano, nit } = filtros;
    const rows = await this.prisma.$queryRaw<RawDetalle[]>(Prisma.sql`
      select cc.operacion,
      nombre_operacion= case when cc.tipo in ('LUB','DLU') THEN 'ACEITE' when d.clase_operacion='R' then r.descripcion
        when d.clase_operacion<>'R' and d.texto is null then tt.descripcion else d.texto end,
      cc.tipo,cc.numero,cc.numero_orden,cc.placa,cc.descripcion as vh, cc.venta_repuestos,cc.venta_mano_obra,cc.segunda_entrega,cc.Instalacion_accesorios,cc.internas
      from (
        select t.nit, v.tecnico,v.operacion,v.seq_orden,v.tipo, v.numero,v.numero_orden,vh.placa,vh.descripcion,
          case when v.bodega in (9,14,21,22) then 0
            when v.tipo in ('IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR') then 0
            else convert(int,SUM(venta_rptos)) end as venta_repuestos,
          case when v.bodega in (9,14,21,22) then 0 else convert(int,SUM(venta_mano_obra)+(isnull(alineacion,0))+(isnull(internas,0)*18824)+(isnull(intalista,0)*18824)) end as venta_mano_obra,
          segunda_entrega=CONVERT(int,(isnull(en.seg_entrega,0)*10000)),
          Instalacion_accesorios=CONVERT(int,(isnull(acc.accesorios,0)*8200)),
          internas=CONVERT(int,SUM(isnull(ic.intcolision,0)+isnull(hc.colision,0)+isnull(ip.intpagas,0)+isnull(iv.intventas,0))*8200)
        from tall_operarios_intranet t
        LEFT JOIN (select Año, Mes, bodega, numero_orden,tipo,numero,operario,tecnico,operacion,seq,seq_orden, venta_rptos, Venta_mano_obra
          from v_factu_tecnico where Año=${ano} and mes=${mes})v on v.operario=t.nit
        LEFT JOIN (select a.operario,a.operacion,a.seq,tipo,numero, SUM(horas) as internas from v_horas_internas a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and bodega not in (9,14,21,22) and cliente not in (92,100,106) and (b.descripcion not like 'segunda entrega%' and a.operacion not in ('PromoAlineacion','30011INSTALACION'))
          group by operario,tipo,numero,a.operacion,a.seq)i on v.operario=i.operario and v.tipo=i.tipo and v.numero=i.numero and v.operacion=i.operacion and v.seq=i.seq
        LEFT JOIN (select a.operario,a.operacion,a.seq,tipo,numero, SUM(horas) as intcolision from v_horas_internas a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and bodega in (9,14,21,22) and (b.descripcion not like 'segunda entrega%' and a.operacion not in ('PromoAlineacion','30011INSTALACION'))
          group by operario,tipo,numero,a.operacion,a.seq)ic on v.operario=ic.operario and v.tipo=ic.tipo and v.numero=ic.numero and v.operacion=ic.operacion and v.seq=ic.seq
        LEFT JOIN (select a.operario,a.operacion,a.seq,tipo,numero, SUM(horas) as intpagas from v_horas_internas a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and bodega not in (9,14,21,22) and cliente in (92,106) and (b.descripcion not like 'segunda entrega%' and a.operacion not in ('PromoAlineacion','30011INSTALACION'))
          group by operario,tipo,numero,a.operacion,a.seq)ip on v.operario=ip.operario and v.tipo=ip.tipo and v.numero=ip.numero and v.operacion=ip.operacion and v.seq=ip.seq
        LEFT JOIN (select a.operario,a.operacion,a.seq,tipo,numero, SUM(horas) as intventas from v_horas_internas a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and bodega not in (9,14,21,22,11) and cliente=100 and (b.descripcion not like 'segunda entrega%' and a.operacion not in ('PromoAlineacion','30011INSTALACION'))
          group by operario,tipo,numero,a.operacion,a.seq)iv on v.operario=iv.operario and v.tipo=iv.tipo and v.numero=iv.numero and v.operacion=iv.operacion and v.seq=iv.seq
        LEFT JOIN (select a.operario,a.operacion,a.seq,tipo,numero, SUM(horas) as intalista from v_horas_internas a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and bodega=11 and cliente=100 and (b.descripcion not like 'segunda entrega%' and a.operacion not in ('PromoAlineacion','30011INSTALACION'))
          group by operario,tipo,numero,a.operacion,a.seq)ia on v.operario=ia.operario and v.tipo=ia.tipo and v.numero=ia.numero and v.operacion=ia.operacion and v.seq=ia.seq
        LEFT JOIN (select operario,a.operacion,a.seq,tipo,numero, count(distinct numero) as seg_entrega from v_horas_internas a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and b.descripcion like 'segunda entrega%'
          group by operario,tipo,numero,a.operacion,a.seq)en on v.operario=en.operario and v.tipo=en.tipo and v.numero=en.numero and v.operacion=en.operacion and v.seq=en.seq
        LEFT JOIN (select operario,operacion,seq,tipo,numero, SUM(horas) as accesorios
          from v_horas_internas where Año=${ano} and mes=${mes} and operacion='30011INSTALACION'
          group by operario,tipo,numero,operacion,seq)acc on v.operario=acc.operario and v.tipo=acc.tipo and v.numero=acc.numero and v.operacion=acc.operacion and v.seq=acc.seq
        LEFT JOIN (select x.bodega,operario,operacion,seq,tipo,numero, convert(int,(count(distinct numero)*tf.valor_hora)) as alineacion from v_horas_internas x
          left join tall_tarifas_taller tf on x.bodega=tf.bodega
          where Año=${ano} and mes=${mes} and operacion in ('PromoAlineacion')
          group by operario,x.bodega,operacion,tipo,numero,tf.valor_hora,seq)al on v.operario=al.operario and v.tipo=al.tipo and v.numero=al.numero and v.operacion=al.operacion and v.seq=al.seq
        LEFT JOIN (select a.operario,a.operacion,tipo,numero, SUM(horas) as colision from v_informe_tecnico a inner join tall_tempario b
          on a.operacion=b.operacion and a.id_tall_tempario = b.id
          where Año=${ano} and mes=${mes} and bodega in (9,14,21,22) and (b.descripcion not like 'segunda entrega%' and a.operacion not in ('PromoAlineacion','30011INSTALACION'))
          group by operario,tipo,numero,a.operacion)hc on v.operario=hc.operario and v.tipo=hc.tipo and v.numero=hc.numero and v.operacion=hc.operacion
        LEFT JOIN tall_encabeza_orden e on v.numero_orden=e.numero
        LEFT JOIN v_vh_vehiculos vh on e.serie=vh.codigo
        WHERE t.patio in (1,3,4,5,6,7,8) and v.Año=${ano} and v.mes=${mes} and t.nit=${nit}
        group by t.nit, v.tecnico,t.patio,i.operario,i.internas,v.numero_orden,v.operacion,seq_orden,v.tipo,v.numero,en.seg_entrega,acc.accesorios,intcolision, colision,vh.placa,vh.descripcion,al.alineacion,v.bodega, ia.intalista
      )cc
      LEFT JOIN tall_tempario tt on cc.operacion=tt.operacion
      LEFT JOIN referencias r ON cc.operacion=r.codigo
      LEFT JOIN tall_detalle_orden d on cc.seq_orden=d.seq
      order by cc.tecnico
    `);

    return rows.map(
      (row) =>
        new DetalleComisionTecnicoEntity({
          factura: `${row.tipo} ${row.numero}`,
          numeroOrden: Number(row.numero_orden ?? 0),
          placa: row.placa,
          vehiculo: row.vh,
          operacion: row.operacion,
          nombreOperacion: row.nombre_operacion,
          ventaRepuestos: Number(row.venta_repuestos ?? 0),
          ventaManoObra: Number(row.venta_mano_obra ?? 0),
          segundaEntrega: Number(row.segunda_entrega ?? 0),
          instalacionAccesorios: Number(row.Instalacion_accesorios ?? 0),
          internas: Number(row.internas ?? 0),
        }),
    );
  }
}
