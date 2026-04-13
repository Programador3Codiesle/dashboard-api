import { Injectable } from '@nestjs/common';
import {
  FiltrosControlVehicular,
  IInformeControlVehicularRepository,
} from '../../domain/informe-control-vehicular.repository';

@Injectable()
export class ExportarControlVehicularUseCase {
  constructor(private readonly repo: IInformeControlVehicularRepository) {}

  async execute(filtros: FiltrosControlVehicular) {
    return this.repo.listarParaExcel(filtros);
  }
}
