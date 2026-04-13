import { Injectable } from '@nestjs/common';
import {
  CodigoRepuestoValidationResult,
  ICotizadorAdicionalesLivianosRepository,
} from '../../domain/cotizador-adicionales-livianos.repository';

@Injectable()
export class ValidarCodigoRepuestoUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(codigo: string): Promise<CodigoRepuestoValidationResult> {
    if (!codigo || !codigo.trim()) {
      return { response: 'error' };
    }

    return this.repo.validateCodigoRepuesto(codigo.trim());
  }
}
