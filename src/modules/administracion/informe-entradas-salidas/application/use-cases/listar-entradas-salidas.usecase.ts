import { Injectable } from '@nestjs/common';
import {
  FiltrosEntradasSalidas,
  IInformeEntradasSalidasRepository,
} from '../../domain/informe-entradas-salidas.repository';

@Injectable()
export class ListarEntradasSalidasUseCase {
  constructor(private readonly repo: IInformeEntradasSalidasRepository) {}

  async execute(filtros: FiltrosEntradasSalidas) {
    return this.repo.listar(filtros);
  }
}
