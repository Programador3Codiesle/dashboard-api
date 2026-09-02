import { Injectable } from '@nestjs/common';
import { IMantenimientoRepository } from '../../domain/mantenimiento.repository';

@Injectable()
export class InformePreventivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(estado?: string, bodega?: string) {
    return this.repo.informePreventivo(
      estado || undefined,
      bodega || undefined,
    );
  }
}

@Injectable()
export class InformeCorrectivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(estado?: string, bodega?: string) {
    return this.repo.informeCorrectivo(
      estado || undefined,
      bodega || undefined,
    );
  }
}
