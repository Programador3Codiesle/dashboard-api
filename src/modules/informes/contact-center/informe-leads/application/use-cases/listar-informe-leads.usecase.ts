import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../../../core/infra/pagination';
import type { InformeLead } from '../../domain/informe-leads.entity';
import { IInformeLeadsRepository } from '../../domain/informe-leads.repository';
import { exigirRangoFechas } from '../rango-fechas-leads';

@Injectable()
export class ListarInformeLeadsUseCase {
  constructor(private readonly repo: IInformeLeadsRepository) {}

  execute(
    desde: string,
    hasta: string,
    pagina: number,
    limite: number,
  ): Promise<PaginatedResult<InformeLead>> {
    exigirRangoFechas(desde, hasta);
    return this.repo.listar({ desde, hasta, pagina, limite });
  }
}
