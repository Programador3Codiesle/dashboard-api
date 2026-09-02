import { Injectable } from '@nestjs/common';
import { ListarRelacionMargenMaterialesColoristaUseCase } from './use-cases/listar-relacion-margen-materiales-colorista.usecase';

@Injectable()
export class RelacionMargenMaterialesColoristaFacade {
  constructor(
    private readonly listarUseCase: ListarRelacionMargenMaterialesColoristaUseCase,
  ) {}

  listar(input: { ano: number; mes: number; sede: string }) {
    return this.listarUseCase.execute(input);
  }
}
