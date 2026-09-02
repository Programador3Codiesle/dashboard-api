import { Injectable } from '@nestjs/common';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import { IGestionCompraRepository } from '../../../gestion-compras/domain/gestion-compra.repository';
import { INuevoAusentismoRepository } from '../../../nuevo-ausentismo/domain/nuevo-ausentismo.repository';
import { ITiempoSuplementarioRepository } from '../../../solicitud-tiempo-suplementario/domain/tiempo-suplementario.repository';

export interface ResponderAutorizacionResult {
  success: boolean;
  message: string;
  accion: 'aprobar' | 'rechazar';
}

@Injectable()
export class ResponderAutorizacionUseCase {
  constructor(
    private readonly tokenService: TokenRespuestaService,
    private readonly gestionCompraRepo: IGestionCompraRepository,
    private readonly ausentismoRepo: INuevoAusentismoRepository,
    private readonly tiempoSuplementarioRepo: ITiempoSuplementarioRepository,
  ) {}

  async execute(
    token: string,
    accion: 'aprobar' | 'rechazar',
  ): Promise<ResponderAutorizacionResult> {
    const { id, tipo } = this.tokenService.validarToken(token);

    switch (tipo) {
      case 'gestion-compra': {
        const estado = accion === 'aprobar' ? 2 : 5;
        const estadoAutorizacion = accion === 'aprobar' ? 3 : 4;
        const ok = await this.gestionCompraRepo.cambiarEstado(
          BigInt(Number(id)),
          estado,
          estadoAutorizacion,
        );
        return {
          success: ok,
          message: ok
            ? accion === 'aprobar'
              ? 'Gestión de compra autorizada.'
              : 'Gestión de compra rechazada.'
            : 'No se pudo actualizar el estado.',
          accion,
        };
      }
      case 'nuevo-ausentismo': {
        const autorizacion = accion === 'aprobar' ? 1 : 2;
        const ok = await this.ausentismoRepo.actualizarAutorizacion(
          BigInt(Number(id)),
          autorizacion,
        );
        return {
          success: ok,
          message: ok
            ? accion === 'aprobar'
              ? 'Ausentismo aprobado.'
              : 'Ausentismo rechazado.'
            : 'No se pudo actualizar la autorización.',
          accion,
        };
      }
      case 'tiempo-suplementario': {
        const autorizacion = accion === 'aprobar' ? 1 : 2;
        const ok = await this.tiempoSuplementarioRepo.actualizarAutorizacion(
          Number(id),
          autorizacion,
        );
        return {
          success: ok,
          message: ok
            ? accion === 'aprobar'
              ? 'Tiempo suplementario aprobado.'
              : 'Tiempo suplementario rechazado.'
            : 'No se pudo actualizar la autorización.',
          accion,
        };
      }
      default:
        return {
          success: false,
          message: 'Tipo de autorización no válido.',
          accion,
        };
    }
  }
}
