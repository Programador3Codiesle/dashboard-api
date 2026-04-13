import { Injectable } from '@nestjs/common';
import {
  ActualizarPqrNpsPayload,
  IPqrNpsRepository,
} from '../../domain/pqr-nps.repository';

@Injectable()
export class GuardarGestionPqrNpsUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(payload: ActualizarPqrNpsPayload): Promise<void> {
    return this.repo.guardarGestion(payload);
  }
}
