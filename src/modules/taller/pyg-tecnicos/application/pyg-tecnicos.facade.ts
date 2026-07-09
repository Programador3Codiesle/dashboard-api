import { Injectable } from '@nestjs/common';
import { GenerarInformeDto } from './dto/generar-informe.dto';
import { GenerarInformeTecnicosUseCase } from './use-cases/generar-informe-tecnicos.use-case';

@Injectable()
export class PygTecnicosFacade {
  constructor(
    private readonly generarInformeTecnicosUseCase: GenerarInformeTecnicosUseCase,
  ) {}

  generarInforme(dto: GenerarInformeDto) {
    return this.generarInformeTecnicosUseCase.execute(dto);
  }
}
