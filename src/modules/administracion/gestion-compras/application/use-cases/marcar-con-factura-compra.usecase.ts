import { ForbiddenException, Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { veTodasLasCompras } from '../visibilidad-compras';

@Injectable()
export class MarcarConFacturaCompraUseCase {
  constructor(private readonly repo: IGestionCompraRepository) {}

  async execute(id: bigint, conFactura: string, perfil: number) {
    if (!veTodasLasCompras(perfil)) {
      throw new ForbiddenException('No tiene permiso para marcar la factura');
    }
    const compra = await this.repo.findById(id);
    if (!compra) {
      return { status: false, message: 'Solicitud no encontrada' };
    }
    if (compra.con_factura === 'Si') {
      return {
        status: false,
        message: 'La solicitud ya está marcada con factura',
      };
    }
    if (compra.estado !== 3 && compra.estado !== 4) {
      return {
        status: false,
        message:
          'La factura solo se marca cuando la compra está en tránsito o despachada',
      };
    }
    if (conFactura !== 'Si') {
      return {
        status: false,
        message: 'Solo se puede marcar la factura como Si',
      };
    }
    const success = await this.repo.marcarConFactura(id, 'Si');
    return {
      status: success,
      message: success
        ? 'Estado de factura actualizado correctamente'
        : 'No se pudo actualizar el estado de factura',
    };
  }
}
