import { Injectable } from '@nestjs/common';
import { GetCatalogosUseCase } from './use-cases/get-catalogos.use-case';
import { GetGraficoUseCase } from './use-cases/get-grafico.use-case';
import { GetGraficoDto } from './dto/get-grafico.dto';

@Injectable()
export class InformePosiblesRetornosFacade {
  constructor(
    private readonly getCatalogosUseCase: GetCatalogosUseCase,
    private readonly getGraficoUseCase: GetGraficoUseCase,
  ) {}

  obtenerCatalogos() {
    return this.getCatalogosUseCase.execute();
  }

  obtenerGrafico(dto: GetGraficoDto) {
    return this.getGraficoUseCase.execute(dto);
  }
}
