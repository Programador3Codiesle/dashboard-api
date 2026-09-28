import { Injectable } from '@nestjs/common';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import { EmailService } from '../../../../../core/infra/email/email.service';
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
    private readonly emailService: EmailService,
    private readonly gestionCompraRepo: IGestionCompraRepository,
    private readonly ausentismoRepo: INuevoAusentismoRepository,
    private readonly tiempoSuplementarioRepo: ITiempoSuplementarioRepository,
  ) {}

  async execute(
    token: string,
    accion: 'aprobar' | 'rechazar',
  ): Promise<ResponderAutorizacionResult> {
    const { id, tipo, idCotizacion } = this.tokenService.validarToken(token);

    switch (tipo) {
      case 'gestion-compra':
        return this.responderGestionCompra(Number(id), accion, idCotizacion);
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
        if (ok) {
          await this.avisarRespuestaHorasExtra(Number(id), accion);
        }
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

  /**
   * Compras.php autorizar_cotizacion / rechazar_cotizacion.
   * Aprobar no cambia el estado de la compra. Rechazar tampoco la pasa a negada.
   * Si ya está autorizada (3), no se vuelve a contestar.
   */
  private async responderGestionCompra(
    idSolicitud: number,
    accion: 'aprobar' | 'rechazar',
    idCotizacion?: number,
  ): Promise<ResponderAutorizacionResult> {
    if (!Number.isFinite(idSolicitud) || idSolicitud <= 0) {
      return {
        success: false,
        message: 'Solicitud no válida.',
        accion,
      };
    }
    const solicitudId = BigInt(idSolicitud);
    const compra = await this.gestionCompraRepo.findById(solicitudId);
    if (!compra) {
      return { success: false, message: 'Solicitud no encontrada.', accion };
    }
    if (compra.estado_autorizacion === 3) {
      return {
        success: false,
        message: 'La solicitud ya fue contestada.',
        accion,
      };
    }

    const fecha = new Date().toLocaleDateString('sv-SE', {
      timeZone: 'America/Bogota',
    });
    let idCotiLog: bigint | null = null;

    if (idCotizacion != null && idCotizacion > 0) {
      const cotizacion = await this.gestionCompraRepo.obtenerCotizacion(
        BigInt(idCotizacion),
      );
      if (!cotizacion || cotizacion.id_compra !== solicitudId) {
        return {
          success: false,
          message: 'La cotización no pertenece a esta solicitud.',
          accion,
        };
      }
      idCotiLog = cotizacion.id_coti;
      if (accion === 'aprobar') {
        await this.gestionCompraRepo.marcarCotizacionEstado(
          cotizacion.id_coti,
          1,
        );
        await this.gestionCompraRepo.rechazarCotizacionesPendientes(
          solicitudId,
        );
        const ok = await this.gestionCompraRepo.guardarResultadoAutorizacion(
          solicitudId,
          3,
          fecha,
          cotizacion.url,
        );
        if (!ok) {
          return {
            success: false,
            message: 'No se pudo actualizar la autorización.',
            accion,
          };
        }
      } else {
        await this.gestionCompraRepo.rechazarCotizacionesPendientes(
          solicitudId,
        );
        const ok = await this.gestionCompraRepo.guardarResultadoAutorizacion(
          solicitudId,
          4,
          fecha,
        );
        if (!ok) {
          return {
            success: false,
            message: 'No se pudo actualizar la autorización.',
            accion,
          };
        }
      }
    } else if (accion === 'aprobar') {
      const ok = await this.gestionCompraRepo.guardarResultadoAutorizacion(
        solicitudId,
        3,
        fecha,
      );
      if (!ok) {
        return {
          success: false,
          message: 'No se pudo actualizar la autorización.',
          accion,
        };
      }
    } else {
      const ok = await this.gestionCompraRepo.guardarResultadoAutorizacion(
        solicitudId,
        4,
        fecha,
      );
      if (!ok) {
        return {
          success: false,
          message: 'No se pudo actualizar la autorización.',
          accion,
        };
      }
    }

    try {
      await this.gestionCompraRepo.insertarLog({
        idSolicitud: solicitudId,
        usuarioReg: 0,
        item: 8,
        idCotizacion: idCotiLog,
      });
    } catch (e) {
      console.error('No se pudo escribir el log de respuesta de compra', e);
    }

    return {
      success: true,
      message:
        accion === 'aprobar'
          ? 'Gestión de compra autorizada.'
          : 'Gestión de compra rechazada.',
      accion,
    };
  }

  private async avisarRespuestaHorasExtra(
    id: number,
    accion: 'aprobar' | 'rechazar',
  ) {
    try {
      const destinos =
        await this.tiempoSuplementarioRepo.obtenerDestinosRespuesta(id);
      if (destinos.to.length === 0) return;
      const estadoTxt = accion === 'aprobar' ? 'APROBADA' : 'RECHAZADA';
      await this.emailService.sendEmail({
        to: destinos.to,
        subject: `Solicitud de trabajo en horario adicional ${estadoTxt}`,
        html: `<p>Señor empleado, su Solicitud de trabajo en horario adicional fue ${estadoTxt}.</p>`,
        empresaId: destinos.empresaId,
      });
    } catch (e) {
      console.error(
        'Error enviando correo de respuesta tiempo suplementario (best-effort):',
        e,
      );
    }
  }
}
