import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  CheckValoresJefeInput,
  FiltrosComisionesJefes,
  FiltrosDetalleComisionJefe,
  IComisionesJefesRepository,
  UpdateValoresJefeInput,
} from '../../domain/comisiones-jefes.repository';
import {
  ComisionJefeEntity,
  DetalleComisionJefeEntity,
  JefePorSedeEntity,
  ValidacionBonosJefeEntity,
} from '../../domain/comisiones-jefes.entity';
import { PERFILES_COMISIONES_JEFES_SIN_FILTRO_NIT } from '../../domain/comisiones-jefes.constants';
import { perfilEn } from '../../../shared/perfil';

type RawComisionJefe = {
  nit: number;
  nombres: string;
  sede: string;
  facturacion_posventa: number;
  internas: number;
  comision_por_facturacion: number;
  utilidad_sede: number | null;
  bono_utilidad: number;
  utilidad_repuestos: number;
  comision_utilidad_bruta: number;
  Bono_NPS: number;
  Bono_nps_interno: number;
};

type RawDetalle = {
  nit: number;
  nombres: string;
  sede: string;
  repuestos: number;
  mano_de_obra: number;
};

type RawBono = {
  bono_nps: number;
  bono_utilidad: number;
  bono_nps_interno: number;
  utilidad_sede: number | null;
};

@Injectable()
export class ComisionesJefesPrismaRepository implements IComisionesJefesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly arrayBonoNps = [
    {
      CEDULA: '1095913265',
      SEDE: 'GASOLINA GIRON',
      'BONO NPS': 250000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 360000,
    },
    {
      CEDULA: '1095913265',
      SEDE: 'DIESEL GIRON',
      'BONO NPS': 250000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 360000,
    },
    {
      CEDULA: '1005051936',
      SEDE: 'GASOLINA GIRON',
      'BONO NPS': 56250,
      'NPS INTERNO': 56250,
      'BONO UTILIDAD': 75000,
    },
    {
      CEDULA: '1005051936',
      SEDE: 'DIESEL GIRON',
      'BONO NPS': 56250,
      'NPS INTERNO': 56250,
      'BONO UTILIDAD': 75000,
    },
    {
      CEDULA: '63368988',
      SEDE: 'COLISION GIRON',
      'BONO NPS': 270000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 360000,
    },
    {
      CEDULA: '84109954',
      SEDE: 'BOCONO',
      'BONO NPS': 250000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 300000,
    },
    {
      CEDULA: '1090449765',
      SEDE: 'COLISION BOCONO',
      'BONO NPS': 220000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 275000,
    },
    {
      CEDULA: '91274670',
      SEDE: 'ROSITA',
      'BONO NPS': 150000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 200000,
    },
    {
      CEDULA: '88309803',
      SEDE: 'BOCONO',
      'BONO NPS': 112500,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 150000,
    },
    {
      CEDULA: '37579713',
      SEDE: 'BARRANCA',
      'BONO NPS': 75000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 100000,
    },
    {
      CEDULA: '91525308',
      SEDE: 'COLISION GIRON',
      'BONO NPS': 150000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 200000,
    },
    {
      CEDULA: '1092358562',
      SEDE: 'COLISION BOCONO',
      'BONO NPS': 120000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 150000,
    },
    {
      CEDULA: '1092355065',
      SEDE: 'BOCONO',
      'BONO NPS': 250000,
      'NPS INTERNO': 0,
      'BONO UTILIDAD': 300000,
    },
  ];

  async listarComisiones(
    filtros: FiltrosComisionesJefes,
  ): Promise<ComisionJefeEntity[]> {
    const { mes, ano, perfilUsuario, nitUsuarioSesion } = filtros;
    const filtroNit =
      perfilUsuario != null &&
      !perfilEn(perfilUsuario, PERFILES_COMISIONES_JEFES_SIN_FILTRO_NIT)
        ? nitUsuarioSesion
        : null;

    const nitWhere = filtroNit
      ? Prisma.sql`AND j.nit = ${filtroNit}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RawComisionJefe[]>(Prisma.sql`
      SELECT j.nit, nombres,j.sede, facturacion_posventa=facturacion_posventa, i.internas, comision_por_facturacion= convert (int,((facturacion_posventa+internas)*p.Porc_facturacion)),
        bono_utilidad=isnull(d.bono_utilidad,0), utilidad_repuestos=utilidad, comision_utilidad_bruta=convert (int,(utilidad*p.porc_utilidad)), Bono_NPS=isnull(d.bono_nps,0),
        Bono_nps_interno=isnull(d.bono_nps_interno,0), d.utilidad_sede
      FROM ( SELECT nit, nombres, sede= case when apartado_aereo=4 then 'Gasolina Giron'
        when apartado_aereo=40 then 'Diesel Giron'
        when apartado_aereo=33 then 'Colision Giron'
        when apartado_aereo=29 then 'Bocono'
        when apartado_aereo=31 then 'Colision Bocono'
        when apartado_aereo=13 then 'Barranca'
        else 'Rosita' end
      FROM terceros where concepto_12 in (11,15,16) UNION SELECT nit, nombres, sede='Diesel Giron' from terceros where apartado_aereo=4)j
      inner join (select f.sede, facturacion_posventa=SUM(facturacion_sede)-sum(isnull(rptos_politicas,0))
      FROM ( SELECT sede,SUM(facturacion_sede) as facturacion_sede
      FROM (SELECT año=YEAR(fec), Mes=month(fec), sede= case when centro=4 then 'Gasolina Giron'
        when centro in (40,105,115) then 'Diesel Giron'
        when centro in (33,45,106,116) then 'Colision Giron'
        when centro in (29,80,185,145,195,155) then 'Bocono'
        when centro in (31,46,186,146,196,156) then 'Colision Bocono'
        when centro in (13,70) then 'Barranca' else 'Rosita' end,
        convert(int,sum(valor_niif)*-1) as facturacion_sede
      FROM movimiento where YEAR(fec)=${ano} and  month(fec)=${mes} and (cuenta like '41%' or cuenta like '530535%')
      and tipo not in ('Z1','IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR','IPG','IPV','DIPG','DIPV','IM',
      'DIM','IC','DIC','DIE','DID','DIO','DTI','ID','IO','TI')
      and centro in (4,40,33,45,29,80,31,46,13,70,16,105,115,106,116,185,145,195,155,186,146,196,156)
      group by YEAR(fec), month(fec),centro ) g
      group by sede)f
      left join
      (SELECT sede,SUM(rptos_politicas) as rptos_politicas FROM (
      SELECT sede= case when centro=4 then 'Gasolina Giron' when centro in (40,105,115) then 'Diesel Giron' when centro in (33,45,106,116)
      then 'Colision Giron' when centro in (29,80,185,145,195,155) then 'Bocono' when centro in (31,46,186,146,196,156) then 'Colision Bocono' when centro in (13,70)
      then 'Barranca' else 'Rosita' end,
      convert (int,SUM(venta_rptos)) as rptos_politicas from v_factu_tecnico a
      inner join movimiento m on a.tipo=m.tipo and a.numero=m.numero where a.operario='232' and a.Año=${ano} and a.Mes=${mes}
      and (m.cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%') group by centro)q
      group by sede)p
      on f.sede=p.sede group by f.sede) c
      on j.sede=c.sede
      inner join (select sede,sum(utilidad) as utilidad from (select año=YEAR(fec),
      Mes=month(fec), sede= case when centro=4 then 'Gasolina Giron' when centro in (40,105,115) then 'Diesel Giron'
      when centro in (33,45,106,116) then 'Colision Giron' when centro in (29,80,185,145,195,155) then 'Bocono' when centro in (31,46,186,146,196,156)
      then 'Colision Bocono' when centro in (13,70) then 'Barranca' else 'Rosita' end, convert(int,sum(valor_niif)*-1) as utilidad
      from movimiento where YEAR(fec)=${ano} and  month(fec)=${mes}
      and (cuenta like '413506%' or cuenta like '417520%' or cuenta like '530535%'
      or cuenta like '613506%') and tipo not in ('Z1','IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR','IPG','IPV','DIPG','DIPV','IM',
      'DIM','IC','DIC','DIE','DID','DIO','DTI','ID','IO','TI') and centro in (4,40,33,45,29,80,31,46,13,70,16,105,115,106,116,185,145,195,155,186,146,196,156)
      group by YEAR(fec), month(fec),centro ) g
      group by g.sede )u on j.sede=u.sede
      inner join postv_porc_jefes p on j.nit=p.Nit and j.sede=p.sede
      left join postv_comisiones_jefes d on j.nit=d.nit and j.sede=d.sede
      left join (select sede,SUM(internas) as internas
      from ( select convert(int,(SUM(horas)*18824)) as internas, sede=case when bodega=1 then 'Gasolina Giron'
      when bodega in (11,301,401) then 'Diesel Giron' when bodega in (9,21,302,402) then 'Colision Giron' when bodega in (8,16,311,411,511,611) then 'Bocono'
      when bodega in (14,22,312,412,512,612) then 'Colision Bocono' when bodega in (6,19) then 'Barranca' else 'Rosita' end
      from v_horas_internas where Año=${ano} and Mes=${mes} and bodega in (1,11,9,21,8,16,14,22,6,19,7,301,401,302,402,311,411,511,611,312,412,512,612)
      group by bodega )r group by sede )i on j.sede=i.sede
      WHERE d.anio = ${ano}
      and d.mes = ${mes}
      ${nitWhere}
      ORDER BY nombres
    `);

    return rows.map((row) => {
      const total =
        Number(row.comision_por_facturacion ?? 0) +
        Number(row.bono_utilidad ?? 0) +
        Number(row.comision_utilidad_bruta ?? 0) +
        Number(row.Bono_NPS ?? 0) +
        Number(row.Bono_nps_interno ?? 0);
      return new ComisionJefeEntity({
        nit: String(row.nit),
        nombres: row.nombres,
        sede: row.sede,
        facturacionPosventa: Number(row.facturacion_posventa ?? 0),
        internas: Number(row.internas ?? 0),
        comisionPorFacturacion: Number(row.comision_por_facturacion ?? 0),
        utilidadSede: Number(row.utilidad_sede ?? 0),
        bonoUtilidad: Number(row.bono_utilidad ?? 0),
        utilidadRepuestos: Number(row.utilidad_repuestos ?? 0),
        comisionUtilidadBruta: Number(row.comision_utilidad_bruta ?? 0),
        bonoNps: Number(row.Bono_NPS ?? 0),
        bonoNpsInterno: Number(row.Bono_nps_interno ?? 0),
        total,
      });
    });
  }

  async obtenerDetalle(
    filtros: FiltrosDetalleComisionJefe,
  ): Promise<DetalleComisionJefeEntity[]> {
    const { mes, ano, nit, sede } = filtros;
    const rows = await this.prisma.$queryRaw<RawDetalle[]>(Prisma.sql`
      select mo.nit,mo.nombres,mo.sede,
      mano_de_obra= mo.mano_de_obra, SUM(repuestos) as repuestos
      from
      (select nit,nombres,j.sede,SUM(mano_obra) as mano_de_obra from
      (select nit, nombres,
      sede= case when apartado_aereo=4 then 'Gasolina Giron'
        when apartado_aereo=40 then 'Diesel Giron'
        when apartado_aereo=33 then 'Colision Giron'
        when apartado_aereo=29 then 'Bocono'
        when apartado_aereo=31 then 'Colision Bocono'
        when apartado_aereo=13 then 'Barranca'
        else 'Rosita' end
      from terceros
      where concepto_12 in (11,15,16)
      union
      select nit, nombres,sede='Diesel Giron' from terceros where concepto_12 in (11,15,16) and apartado_aereo='4'
      )j
      inner join
      (select año=YEAR(fec), Mes=month(fec),
      sede= case when centro=4 then 'Gasolina Giron'
        when centro=40 then 'Diesel Giron'
        when centro in (33,45) then 'Colision Giron'
        when centro in (29,80) then 'Bocono'
        when centro in (31,46) then 'Colision Bocono'
        when centro in (13,70) then 'Barranca'
        else 'Rosita' end,
      convert(int,sum(valor_niif)*-1) as mano_obra
      from movimiento where YEAR(fec)=${ano} and  month(fec)=${mes} and
      (cuenta like '413504%' or cuenta like '417510%' or cuenta like '53053560%')
      and centro in (4,40,33,45,29,80,31,46,13,70,16)  and tipo not in ('Z1','IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR','IPG','IPV','DIPG','DIPV')
      group by YEAR(fec), month(fec),centro) f
      on j.sede=f.sede
      group by nit,nombres,j.sede
      )mo
      inner join
      (select año=YEAR(fec), Mes=month(fec),
      sede= case when centro=4 then 'Gasolina Giron'
        when centro=40 then 'Diesel Giron'
        when centro in (33,45) then 'Colision Giron'
        when centro in (29,80) then 'Bocono'
        when centro in (31,46) then 'Colision Bocono'
        when centro in (13,70) then 'Barranca'
        else 'Rosita' end,
      convert(int,sum(valor_niif)*-1) as repuestos
      from movimiento  where YEAR(fec)=${ano} and  month(fec)=${mes} and
      (cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%')
      and centro in (4,40,33,45,29,80,31,46,13,70,16) and tipo not in ('Z1','IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR','IPG','IPV','DIPG','DIPV')
      group by YEAR(fec), month(fec),centro) r
      on mo.sede=r.sede
      LEFT join
      (select año=YEAR(fec), Mes=month(fec),
      sede= 'Bocono',convert(int, sum(valor_niif)*-1) as repuestos_sacyr
      from movimiento  where YEAR(fec)=${ano} and  month(fec)=${mes} and nit=901361064 and
      (cuenta like '413506%' or cuenta like '417520%' or cuenta like '53053580%') and centro in (29,80) and tipo not in ('Z1','IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR','IPG','IPV','DIPG','DIPV')
      group by YEAR(fec), month(fec),centro) rs
      on mo.sede=rs.sede
      left join
      (select año=YEAR(fec), Mes=month(fec),
      sede= 'Bocono',convert(int,sum(valor_niif)*-1) as mo_sacyr
      from movimiento  where YEAR(fec)=${ano} and  month(fec)=${mes} and nit=901361064 and
      (cuenta like '413504%' or cuenta like '417510%' or cuenta like '53053560%') and centro in (29,80) and tipo not in ('Z1','IT','DIT','IK','DIK','WI','DIW','IL','DIL','IR','DIR','IPG','IPV','DIPG','DIPV')
      group by YEAR(fec), month(fec),centro) ms
      on mo.sede=ms.sede
      WHERE mo.nit = ${nit} and mo.sede=${sede}
      group by mo.nit,mo.nombres,mo.sede,mo.mano_de_obra
    `);

    return rows.map(
      (row) =>
        new DetalleComisionJefeEntity({
          nit: String(row.nit),
          nombres: row.nombres,
          sede: row.sede,
          repuestos: Number(row.repuestos ?? 0),
          manoDeObra: Number(row.mano_de_obra ?? 0),
        }),
    );
  }

  async obtenerJefesPorSede(sede: string): Promise<JefePorSedeEntity[]> {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const rows = await this.prisma.$queryRaw<
      Array<{ nit: number; nombres: string }>
    >(
      Prisma.sql`
      SELECT pcj.nit, t.nombres
      FROM postv_comisiones_jefes pcj
      INNER JOIN terceros t ON t.nit = pcj.nit
      WHERE pcj.sede = ${sede}
        AND pcj.anio = ${year}
        AND pcj.mes = ${month}
      `,
    );
    return rows.map(
      (row) =>
        new JefePorSedeEntity({
          nit: String(row.nit),
          nombres: row.nombres,
        }),
    );
  }

  async checkValoresMesAnterior(input: CheckValoresJefeInput) {
    const { comboJefes, sede } = input;
    const { year, month } = this.getPreviousMonth();

    const bonos = await this.prisma.$queryRaw<RawBono[]>(Prisma.sql`
      SELECT bono_nps, bono_utilidad, bono_nps_interno, utilidad_sede
      FROM postv_comisiones_jefes
      WHERE nit = ${Number(comboJefes)} AND anio = ${year} AND mes = ${month} AND sede = ${sede}
    `);

    const data = bonos.map(
      (row) =>
        new ValidacionBonosJefeEntity({
          bonoNps: Number(row.bono_nps ?? 0),
          bonoUtilidad: Number(row.bono_utilidad ?? 0),
          bonoNpsInterno: Number(row.bono_nps_interno ?? 0),
          utilidadSede: Number(row.utilidad_sede ?? 0),
        }),
    );

    const bonoMatriz =
      this.arrayBonoNps.find(
        (item) =>
          item.CEDULA === comboJefes && item.SEDE === sede.trim().toUpperCase(),
      ) ?? null;

    return { data, bonoMatriz };
  }

  async actualizarValores(input: UpdateValoresJefeInput) {
    const {
      comboJefes,
      sede,
      utilidadSede,
      bonoNps,
      bonoNpsInterno,
      bonoUtilidad,
    } = input;
    if (!comboJefes || !sede) {
      throw new BadRequestException(
        'Debe seleccionar un jefe y una sede, son campos obligatorios.',
      );
    }

    const matriz = this.arrayBonoNps.find(
      (item) =>
        item.CEDULA === comboJefes && item.SEDE === sede.trim().toUpperCase(),
    );
    if (!matriz) {
      throw new BadRequestException(
        `El jefe seleccionado no figura en la matriz de nómina con la sede ${sede}.`,
      );
    }

    const { year, month } = this.getPreviousMonth();
    const nit = Number(comboJefes);
    const existing = await this.prisma.$queryRaw<
      Array<{ nit: number }>
    >(Prisma.sql`
      SELECT nit
      FROM postv_comisiones_jefes
      WHERE nit = ${nit} AND anio = ${year} AND mes = ${month} AND sede = ${sede}
    `);
    if (existing.length === 0) {
      return {
        updated: false,
        message:
          'El jefe seleccionado no figura en la base de datos (Comisiones Jefe) para el período anterior.',
      };
    }

    const setParts: Prisma.Sql[] = [];
    if (utilidadSede != null) {
      setParts.push(Prisma.sql`utilidad_sede = ${utilidadSede}`);
    }
    if (bonoNps) {
      setParts.push(Prisma.sql`bono_nps = ${matriz['BONO NPS']}`);
    }
    if (bonoUtilidad) {
      setParts.push(Prisma.sql`bono_utilidad = ${matriz['BONO UTILIDAD']}`);
    }
    if (bonoNpsInterno) {
      setParts.push(Prisma.sql`bono_nps_interno = ${matriz['NPS INTERNO']}`);
    }
    if (setParts.length === 0) {
      return { updated: false, message: 'No hay valores para actualizar.' };
    }

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_comisiones_jefes
      SET ${Prisma.join(setParts, ', ')}
      WHERE nit = ${nit} AND anio = ${year} AND mes = ${month} AND sede = ${sede}
    `);

    return {
      updated: true,
      message: 'Se ha actualizado exitosamente la comisión del jefe.',
    };
  }

  private getPreviousMonth() {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
}
