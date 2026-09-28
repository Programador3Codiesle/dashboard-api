import { ForbiddenException, Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CambiarEstadoCompraDto } from '../dto/cambiar-estado-compra.dto';
import { veTodasLasCompras } from '../visibilidad-compras';

@Injectable()
export class CambiarEstadoCompraUseCase {
  constructor(private readonly repo: IGestionCompraRepository) {}

  async execute(
    id: bigint,
    dto: CambiarEstadoCompraDto,
    perfil: number,
    idUsuario: number,
  ) {
    if (!veTodasLasCompras(perfil)) {
      throw new ForbiddenException(
        'No tiene permiso para cambiar el estado de la compra',
      );
    }
    const compra = await this.repo.findById(id);
    if (!compra) {
      return { status: false, message: 'Solicitud no encontrada' };
    }
    if (compra.estado === 4 || compra.estado === 5) {
      return {
        status: false,
        message:
          'No se puede cambiar el estado de una solicitud despachada o negada',
      };
    }
    const success = await this.repo.cambiarEstado(id, dto.estado);
    if (success) {
      await this.repo.insertarLog({
        idSolicitud: id,
        usuarioReg: idUsuario,
        item: dto.estado,
      });
    }
    return {
      status: success,
      message: success
        ? 'Estado de compra actualizado correctamente'
        : 'No se pudo actualizar el estado de la compra',
    };
  }
}
