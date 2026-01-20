import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CreateGestionCompraDto } from '../dto/create-gestion-compra.dto';

@Injectable()
export class CrearSolicitudCompraUseCase {
    constructor(private readonly repo: IGestionCompraRepository) {}

    async execute(dto: CreateGestionCompraDto, userId: number) {
        return this.repo.create({
            ...dto,
            fecha_solicitud: new Date(),
            fecha_tentativa: new Date(dto.fecha_tentativa),
            usu_solicita: userId,
            estado: 1, // Pendiente
            estado_autorizacion: 0 // Sin autorizar
        });
    }
}
