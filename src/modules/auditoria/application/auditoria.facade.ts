import { Injectable } from '@nestjs/common';
import { EntregasUseCase } from './use-cases/entregas.usecase';
import { FacturacionTallerUseCase } from './use-cases/facturacion-taller.usecase';
import { FacturacionTecnicoUseCase } from './use-cases/facturacion-tecnico.usecase';
import { ListarTecnicosUseCase } from './use-cases/listar-tecnicos.usecase';
import { NpsFabricaSedesUseCase } from './use-cases/nps-fabrica-sedes.usecase';
import { NpsFabricaTecnicosUseCase } from './use-cases/nps-fabrica-tecnicos.usecase';
import { OrdenesDiariasUseCase } from './use-cases/ordenes-diarias.usecase';
import { OrdenesMttoPreventivoUseCase } from './use-cases/ordenes-mtto-preventivo.usecase';
import { OrdenesTecnicosUseCase } from './use-cases/ordenes-tecnicos.usecase';

@Injectable()
export class AuditoriaFacade {
  constructor(
    private readonly ordenesDiariasUc: OrdenesDiariasUseCase,
    private readonly entregasUc: EntregasUseCase,
    private readonly facturacionTallerUc: FacturacionTallerUseCase,
    private readonly facturacionTecnicoUc: FacturacionTecnicoUseCase,
    private readonly ordenesMttoUc: OrdenesMttoPreventivoUseCase,
    private readonly ordenesTecnicosUc: OrdenesTecnicosUseCase,
    private readonly listarTecnicosUc: ListarTecnicosUseCase,
    private readonly npsSedesUc: NpsFabricaSedesUseCase,
    private readonly npsTecnicosUc: NpsFabricaTecnicosUseCase,
  ) {}

  ordenesDiarias(fecha: string, bodega: string) {
    return this.ordenesDiariasUc.execute(fecha, bodega);
  }

  entregas(ano: number, tipo: number) {
    return this.entregasUc.execute(ano, tipo);
  }

  facturacionTaller(bodega: string) {
    return this.facturacionTallerUc.execute(bodega);
  }

  facturacionTecnico(bodega?: string, tecnico?: string) {
    return this.facturacionTecnicoUc.execute(bodega, tecnico);
  }

  ordenesMttoPreventivo(bodega: string) {
    return this.ordenesMttoUc.execute(bodega);
  }

  ordenesTecnicos(bodega?: string, tecnico?: string) {
    return this.ordenesTecnicosUc.execute(bodega, tecnico);
  }

  listarTecnicos() {
    return this.listarTecnicosUc.execute();
  }

  npsFabricaSedes(fecha: string) {
    return this.npsSedesUc.execute(fecha);
  }

  npsFabricaTecnicos(fecha: string, sede?: string) {
    return this.npsTecnicosUc.execute(fecha, sede);
  }
}
