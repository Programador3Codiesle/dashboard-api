import { Injectable } from '@nestjs/common';
import { FiltrosRelacionMargenMaterialesColorista } from '../domain/relacion-margen-materiales-colorista.repository';
import { ListarRelacionMargenMaterialesColoristaUseCase } from './use-cases/listar-relacion-margen-materiales-colorista.usecase';

@Injectable()
export class RelacionMargenMaterialesColoristaFacade {
  constructor(
    private readonly listarUseCase: ListarRelacionMargenMaterialesColoristaUseCase,
  ) {}

  listar(filtros: FiltrosRelacionMargenMaterialesColorista) {
    return this.listarUseCase.execute(filtros);
  }
}
