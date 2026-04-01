import { Injectable } from '@nestjs/common';
import { IInformeControlVehicularRepository } from '../../domain/informe-control-vehicular.repository';

@Injectable()
export class DetalleControlVehicularUseCase {
  constructor(private readonly repo: IInformeControlVehicularRepository) {}

  async execute(id: number) {
    return this.repo.findById(id);
  }
}

