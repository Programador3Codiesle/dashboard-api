import { Injectable } from '@nestjs/common';
import {
  FiltrosInformeEntradaVh,
  IInformeEntradaVhRepository,
} from '../../domain/entrada-vh.repository';
import { InformeEntradaVhResumenEntity } from '../../domain/entrada-vh.entity';

@Injectable()
export class ObtenerInformeEntradaVhUseCase {
  constructor(
    private readonly informeEntradaVhRepository: IInformeEntradaVhRepository,
  ) {}

  async execute(
    filtros: FiltrosInformeEntradaVh,
  ): Promise<InformeEntradaVhResumenEntity> {
    return this.informeEntradaVhRepository.obtenerResumen(filtros);
  }
}
