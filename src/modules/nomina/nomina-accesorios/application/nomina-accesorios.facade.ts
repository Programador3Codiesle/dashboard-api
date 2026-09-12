import { Injectable } from '@nestjs/common';
import { ListarNominaAccesoriosUseCase } from './use-cases/listar-nomina-accesorios.usecase';

@Injectable()
export class NominaAccesoriosFacade {
  constructor(private readonly listarUseCase: ListarNominaAccesoriosUseCase) {}

  listar(input: {
    ano: number;
    mes: number;
    tipo: number;
    perfilUsuario: number | null;
    nitUsuarioSesion: number | null;
  }) {
    return this.listarUseCase.execute(input);
  }
}
