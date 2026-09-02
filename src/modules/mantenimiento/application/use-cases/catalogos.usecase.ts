import { Injectable } from '@nestjs/common';
import { IMantenimientoRepository } from '../../domain/mantenimiento.repository';

@Injectable()
export class CatalogosUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute() {
    return Promise.all([
      this.repo.getFamilias(),
      this.repo.listarJefes(),
      this.repo.listarPersonalMto(),
      this.repo.listarBodegasMto(),
      this.repo.listarEquiposActivos(),
    ]).then(([familias, jefes, personal, bodegas, equipos]) => ({
      familias,
      jefes,
      personal,
      bodegas,
      equipos,
    }));
  }
}
