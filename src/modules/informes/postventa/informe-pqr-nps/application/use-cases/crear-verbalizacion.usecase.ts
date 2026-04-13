import { Injectable } from '@nestjs/common';
import {
  CrearVerbalizacionPayload,
  IPqrNpsRepository,
} from '../../domain/pqr-nps.repository';

@Injectable()
export class CrearVerbalizacionUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(payload: CrearVerbalizacionPayload): Promise<void> {
    return this.repo.crearVerbalizacion(payload);
  }
}
