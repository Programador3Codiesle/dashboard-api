import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';

@Injectable()
export class MarcarConFacturaCompraUseCase {
  constructor(private readonly repo: IGestionCompraRepository) {}

  async execute(id: bigint, conFactura: string) {
    const success = await this.repo.marcarConFactura(id, conFactura);
    return {
      status: success,
      message: success
        ? 'Estado de factura actualizado correctamente'
        : 'No se pudo actualizar el estado de factura',
    };
  }
}
