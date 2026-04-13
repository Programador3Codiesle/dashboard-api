import { Injectable } from '@nestjs/common';
import { IVentas1a1Repository } from '../../domain/ventas-1a1.repository';
import { Ventas1a1AsesorEntity } from '../../domain/ventas-1a1.entity';

@Injectable()
export class ObtenerAsesoresVentas1a1UseCase {
  constructor(private readonly ventas1a1Repository: IVentas1a1Repository) {}

  async execute(): Promise<Ventas1a1AsesorEntity[]> {
    return this.ventas1a1Repository.obtenerAsesores();
  }
}
