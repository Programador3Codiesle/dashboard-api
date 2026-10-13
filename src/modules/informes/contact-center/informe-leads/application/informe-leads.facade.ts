import { Injectable } from '@nestjs/common';
import { ExportarInformeLeadsExcelUseCase } from './use-cases/exportar-informe-leads-excel.usecase';
import { ListarInformeLeadsUseCase } from './use-cases/listar-informe-leads.usecase';

@Injectable()
export class InformeLeadsFacade {
  constructor(
    private readonly listarInformeLeads: ListarInformeLeadsUseCase,
    private readonly exportarInformeLeadsExcel: ExportarInformeLeadsExcelUseCase,
  ) {}

  listar(desde: string, hasta: string, pagina: number, limite: number) {
    return this.listarInformeLeads.execute(desde, hasta, pagina, limite);
  }

  exportarExcel(desde: string, hasta: string) {
    return this.exportarInformeLeadsExcel.execute(desde, hasta);
  }
}
