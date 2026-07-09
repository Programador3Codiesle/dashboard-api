import { Injectable } from '@nestjs/common';
import { CatalogosInformeEntity } from '../../domain/entities/informe-posibles-retornos.entity';
import { IInformePosiblesRetornosRepository } from '../../domain/repositories/informe-posibles-retornos.repository.interface';

@Injectable()
export class GetCatalogosUseCase {
  constructor(
    private readonly repository: IInformePosiblesRetornosRepository,
  ) {}

  async execute(): Promise<CatalogosInformeEntity> {
    const tecnicos = await this.repository.getTecnicos();
    const bodegas = await this.repository.getBodegas();

    return { tecnicos, bodegas };
  }
}
