import { Injectable } from '@nestjs/common';
import { ObtenerRetencion720UseCase } from './use-cases/obtener-retencion-72-0.usecase';
import {
  ConsultasRetencion720UseCase,
  ModoComparacion,
  ResumenConComparacionResult,
} from './use-cases/consultas-retencion-72-0.usecase';
import {
  Retencion720FiltroRowEntity,
  Retencion720RowEntity,
  Retencion720TablaGeneralRow,
  Retencion720VehiculoRowEntity,
} from '../domain/retencion-72-0.entity';
import {
  IRetencion720Repository,
  Retencion720Paginated,
} from '../domain/retencion-72-0.repository';

@Injectable()
export class Retencion720Facade {
  constructor(
    private readonly obtenerRetencionUseCase: ObtenerRetencion720UseCase,
    private readonly consultas: ConsultasRetencion720UseCase,
    private readonly repo: IRetencion720Repository,
  ) {}

  obtenerResumen(): Promise<Retencion720RowEntity[]> {
    return this.obtenerRetencionUseCase.execute();
  }

  listarSegmentosAutos(): Promise<string[]> {
    return this.consultas.listarSegmentosAutos();
  }

  listarSegmentosByC(): Promise<string[]> {
    return this.consultas.listarSegmentosByC();
  }

  obtenerFiltroAutos(filtro: string): Promise<Retencion720FiltroRowEntity[]> {
    return this.consultas.obtenerFiltroAutos(filtro);
  }

  obtenerFiltroByC(filtro: string): Promise<Retencion720FiltroRowEntity[]> {
    return this.consultas.obtenerFiltroByC(filtro);
  }

  listarFamiliasPorSegmento(segmento: string): Promise<string[]> {
    return this.consultas.listarFamiliasPorSegmento(segmento);
  }

  obtenerPorFamilias(
    segmento: string,
    familias: string[],
  ): Promise<Retencion720FiltroRowEntity[]> {
    return this.consultas.obtenerPorFamilias(segmento, familias);
  }

  obtenerResumenConComparacion(
    modo: ModoComparacion,
    filtro: string,
  ): Promise<ResumenConComparacionResult> {
    return this.consultas.obtenerResumenConComparacion(modo, filtro);
  }

  listarVehiculos12Meses(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>> {
    return this.repo.listarVehiculosUltimos12Meses(page, pageSize);
  }

  listarVehiculosAnoActual(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>> {
    return this.repo.listarVehiculosAnoActual(page, pageSize);
  }

  listarTablaGeneralDetalle(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720TablaGeneralRow>> {
    return this.repo.listarTablaGeneralDetalle(page, pageSize);
  }

  obtenerGrafGeneralVs(): Promise<Retencion720FiltroRowEntity[]> {
    return this.repo.obtenerGrafGeneralVs();
  }

  async obtenerGrafAutosByCVs(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    await this.consultas.assertSegmentoVsValido(filtro);
    return this.repo.obtenerGrafAutosByCVs(filtro);
  }

  async obtenerInfGrafGeneralSegmento(
    segmento: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    await this.consultas.assertSegmentoVsValido(segmento);
    return this.repo.obtenerInfGrafGeneralSegmento(segmento);
  }
}
