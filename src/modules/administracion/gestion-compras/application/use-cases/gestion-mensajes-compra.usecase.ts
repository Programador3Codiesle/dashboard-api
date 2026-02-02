import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CrearMensajeCompraDto } from '../dto/crear-mensaje-compra.dto';

@Injectable()
export class GestionMensajesCompraUseCase {
    constructor(private readonly repo: IGestionCompraRepository) {}

    async crearMensaje(solicitudId: bigint, nitUsuario: number, dto: CrearMensajeCompraDto) {
        const success = await this.repo.crearMensaje(solicitudId, nitUsuario, dto.mensaje);
        return {
            status: success,
            message: success 
                ? 'Mensaje creado correctamente'
                : 'No se pudo crear el mensaje'
        };
    }

    async listarMensajes(solicitudId: bigint) {
        const mensajes = await this.repo.listarMensajes(solicitudId);
        // Convertir BigInt a string para serialización JSON y formatear fecha en zona Bogotá
        return {
            status: true,
            message: 'Mensajes obtenidos correctamente',
            data: mensajes.map(msg => ({
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
            }))
        };
    }
}
