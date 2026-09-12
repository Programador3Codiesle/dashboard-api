import { Injectable } from '@nestjs/common';
import { IEncuestaSatisfaccionRepository } from '../../domain/encuesta-satisfaccion.repository';
import { EncuestaSatisfaccionBodegaEntity } from '../../domain/encuesta-satisfaccion.entity';

@Injectable()
export class ListarBodegasEncuestaSatisfaccionUseCase {
  constructor(private readonly encuestaRepo: IEncuestaSatisfaccionRepository) {}

  execute(empresaId: number): Promise<EncuestaSatisfaccionBodegaEntity[]> {
    return this.encuestaRepo.listarBodegas(empresaId);
  }
}
