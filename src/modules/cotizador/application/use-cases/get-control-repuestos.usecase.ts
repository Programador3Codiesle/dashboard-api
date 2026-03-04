import { Injectable } from '@nestjs/common';
import {
  FilaControlRepuesto,
  ICotizadorControlRepository,
} from '../../domain/cotizador-control.repository';

@Injectable()
export class GetControlRepuestosUseCase {
  constructor(private readonly repo: ICotizadorControlRepository) {}

  async execute(): Promise<FilaControlRepuesto[]> {
    return this.repo.getControlRepuestos();
  }
}
