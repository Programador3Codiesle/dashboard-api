import { Injectable } from '@nestjs/common';
import { GenerarInformeDto } from './dto/generar-informe.dto';
import { GenerarInformeAsesoresUseCase } from './use-cases/generar-informe-asesores.use-case';

@Injectable()
export class PygAsesoresRepuestosFacade {
  constructor(
    private readonly generarInformeAsesoresUseCase: GenerarInformeAsesoresUseCase,
  ) {}

  generarInforme(dto: GenerarInformeDto, idEmpresa: number) {
    return this.generarInformeAsesoresUseCase.execute(dto, idEmpresa);
  }
}
