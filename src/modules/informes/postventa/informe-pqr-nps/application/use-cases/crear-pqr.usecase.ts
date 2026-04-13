import { Injectable } from '@nestjs/common';
import {
  CrearPqrPayload,
  IPqrNpsRepository,
} from '../../domain/pqr-nps.repository';

@Injectable()
export class CrearPqrUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(payload: CrearPqrPayload): Promise<void> {
    return this.repo.crearPqr(payload);
  }
}
