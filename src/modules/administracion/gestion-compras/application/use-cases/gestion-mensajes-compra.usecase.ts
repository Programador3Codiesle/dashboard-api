import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CrearMensajeCompraDto } from '../dto/crear-mensaje-compra.dto';

@Injectable()
export class GestionMensajesCompraUseCase {
  constructor(private readonly repo: IGestionCompraRepository) {}

  async crearMensaje(
    solicitudId: bigint,
    nitUsuario: number,
    dto: CrearMensajeCompraDto,
    idUsuario: number,
  ) {
    const compra = await this.repo.findById(solicitudId);
    if (!compra) {
      return { status: false, message: 'Solicitud no encontrada' };
    }
    if (compra.estado === 4 || compra.estado === 5) {
      return {
        status: false,
        message:
          'No se pueden agregar mensajes a una solicitud despachada o negada',
      };
    }
    const idMensaje = await this.repo.crearMensaje(
      solicitudId,
      nitUsuario,
      dto.mensaje,
    );
    if (idMensaje != null) {
      await this.repo.insertarLog({
        idSolicitud: solicitudId,
        usuarioReg: idUsuario,
        item: 6,
        idMensaje,
      });
    }
    return {
      status: idMensaje != null,
      message:
        idMensaje != null
          ? 'Mensaje creado correctamente'
          : 'No se pudo crear el mensaje',
    };
  }

  async listarMensajes(solicitudId: bigint) {
    const mensajes = await this.repo.listarMensajes(solicitudId);
    // Convertir BigInt a string para serialización JSON y formatear fecha en zona Bogotá
    return {
      status: true,
      message: 'Mensajes obtenidos correctamente',
      data: mensajes.map((msg) => ({
        id_mensaje: msg.id_mensaje.toString(),
        nit_usu: msg.nit_usu,
        nombres: msg.nombres,
        mensaje: msg.mensaje,
        fecha: msg.fecha.toLocaleDateString('es-CO', {
          timeZone: 'America/Bogota',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        solicitud_compra: msg.solicitud_compra.toString(),
      })),
    };
  }
}
