import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { IGarantiasDashboardRepository } from '../../domain/garantias.repository';
import {
  DashboardGarantiasDto,
  GarantiasBodegaDto,
  GarantiasMesDto,
} from '../dto/dashboard-response.dto';

const MESES_NOM = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function mesAnoSeleccion(
  mes: number | undefined,
  ano: number | undefined,
  actual: { mes: number; ano: number },
): { mes: number; ano: number } {
  const anoOk =
    ano != null && Number.isInteger(ano) && ano >= 2000 && ano <= 2100
      ? ano
      : actual.ano;
  const mesOk =
    mes != null && Number.isInteger(mes) && mes >= 1 && mes <= 12
      ? mes
      : actual.mes;
  return { mes: mesOk, ano: anoOk };
}

@Injectable()
export class GarantiasService {
  constructor(
    private readonly commonRepo: IDashboardCommonRepository,
    private readonly garantiasRepo: IGarantiasDashboardRepository,
  ) {}

  async buildGarantias(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    mes?: number,
    ano?: number,
    idEmpresa?: number,
  ): Promise<DashboardGarantiasDto> {
    const base: DashboardGarantiasDto = {
      variant: 'garantias',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      bodegas: [],
    };
    if (idEmpresa == null) return base;

    const actual = (await this.commonRepo.getMesAnoActual()) ?? {
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
    };
    const seleccionado = mesAnoSeleccion(mes, ano, actual);
    const sedesRows = await this.commonRepo.getSedesUser(nitUsuario, idEmpresa);
    if (sedesRows.length === 0) return base;

    const sedes = [...sedesRows].sort(
      (a, b) =>
        (a.descripcion ?? '').localeCompare(b.descripcion ?? '', 'es') ||
        a.idsede - b.idsede,
    );
    const ventas = await this.garantiasRepo.getVentasGarantia(
      sedes.map((sede) => sede.idsede),
      seleccionado.ano,
      seleccionado.mes,
    );
    const porSedeMes = new Map<string, (typeof ventas)[number]>();
    for (const row of ventas) {
      porSedeMes.set(`${row.sede}-${row.mes}`, row);
    }

    base.bodegas = sedes.map((sede) =>
      armarBodega(sede.idsede, sede.descripcion, seleccionado.mes, porSedeMes),
    );
    return base;
  }
}

function armarBodega(
  idsede: number,
  descripcion: string | undefined,
  mesHasta: number,
  porSedeMes: Map<
    string,
    { mo: number; rptos: number; tot: number; horas: number }
  >,
): GarantiasBodegaDto {
  const meses: GarantiasMesDto[] = [];
  for (let mes = 1; mes <= mesHasta; mes++) {
    const row = porSedeMes.get(`${idsede}-${mes}`);
    const mo = row?.mo ?? 0;
    const repuestos = row?.rptos ?? 0;
    const tot = row?.tot ?? 0;
    const horas = row?.horas ?? 0;
    meses.push({
      mes,
      mesNom: MESES_NOM[mes] ?? '',
      mo,
      repuestos,
      tot,
      horas,
      total: mo + repuestos + tot,
    });
  }
  const actual = meses[meses.length - 1];
  return {
    idsede,
    sede: descripcion?.trim() || `Bodega ${idsede}`,
    mo: actual?.mo ?? 0,
    repuestos: actual?.repuestos ?? 0,
    tot: actual?.tot ?? 0,
    horas: actual?.horas ?? 0,
    total: actual?.total ?? 0,
    meses,
  };
}
