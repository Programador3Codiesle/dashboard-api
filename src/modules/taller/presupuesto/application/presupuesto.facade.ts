import { Injectable } from '@nestjs/common';
import { ActualizarPresupuestoDto } from './dto/actualizar-presupuesto.dto';
import { ConsultarPresupuestoDto } from './dto/consultar-presupuesto.dto';
import { ActualizarPresupuestoUseCase } from './use-cases/actualizar-presupuesto.use-case';
import { ConsultarPresupuestoUseCase } from './use-cases/consultar-presupuesto.use-case';
import { ObtenerCatalogosPresupuestoUseCase } from './use-cases/obtener-catalogos.use-case';

@Injectable()
export class PresupuestoFacade {
  constructor(
    private readonly obtenerCatalogosUseCase: ObtenerCatalogosPresupuestoUseCase,
    private readonly consultarPresupuestoUseCase: ConsultarPresupuestoUseCase,
    private readonly actualizarPresupuestoUseCase: ActualizarPresupuestoUseCase,
  ) {}

  obtenerCatalogos() {
    return this.obtenerCatalogosUseCase.execute();
  }

  consultar(dto: ConsultarPresupuestoDto, perfilUsuario: number | null) {
    return this.consultarPresupuestoUseCase.execute(dto, perfilUsuario);
  }

  actualizar(
    dto: ActualizarPresupuestoDto,
    perfilUsuario: number | null,
    userId: number,
  ) {
    return this.actualizarPresupuestoUseCase.execute(
      dto,
      perfilUsuario,
      userId,
    );
  }
}
