import { Injectable } from '@nestjs/common';
import { CrearFormatoDesempenoUseCase } from './use-cases/crear-formato-desempeno.usecase';
import { ObtenerFormatoDesempenoUseCase } from './use-cases/obtener-formato-desempeno.usecase';
import { CreateFormatoDesempenoDto } from './dto/create-formato-desempeno.dto';

@Injectable()
export class FormatoDesempenoFacade {
  constructor(
    private readonly crearFormatoUC: CrearFormatoDesempenoUseCase,
    private readonly obtenerFormatoUC: ObtenerFormatoDesempenoUseCase,
  ) {}

  crearFormato(dto: CreateFormatoDesempenoDto) {
    return this.crearFormatoUC.execute(dto);
  }

  obtenerFormato(empleadoId: number) {
    return this.obtenerFormatoUC.execute(empleadoId);
  }
}
