import { Injectable } from '@nestjs/common';
import { IEncuestaSatisfaccionRepository } from '../../domain/encuesta-satisfaccion.repository';
import { EncuestaSatisfaccionTecnicoEntity } from '../../domain/encuesta-satisfaccion.entity';

@Injectable()
export class ListarTecnicosEncuestaSatisfaccionUseCase {
  constructor(private readonly encuestaRepo: IEncuestaSatisfaccionRepository) {}

  execute(
    bode: string,
    empresaId: number,
  ): Promise<EncuestaSatisfaccionTecnicoEntity[]> {
    return this.encuestaRepo.listarTecnicos(bode ?? '', empresaId);
  }
}
