import { Injectable } from '@nestjs/common';
import { IMpviCatalogoRepository } from '../../domain/mpvi-catalogo.repository';

export type CatalogoTipo =
  | 'sistemas'
  | 'subsistemas'
  | 'familias-vh'
  | 'vehiculos'
  | 'repuestos';

@Injectable()
export class ListarCatalogoMpviUseCase {
  constructor(private readonly repo: IMpviCatalogoRepository) {}

  execute(tipo: CatalogoTipo) {
    switch (tipo) {
      case 'sistemas':
        return this.repo.getSistemas();
      case 'subsistemas':
        return this.repo.getSubsistemas();
      case 'familias-vh':
        return this.repo.getFamiliasVh();
      case 'vehiculos':
        return this.repo.getVehiculos();
      case 'repuestos':
        return this.repo.getRepuestos();
    }
  }
}
