import { Injectable, BadRequestException } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CreateGestionCompraDto } from '../dto/create-gestion-compra.dto';

@Injectable()
export class CrearSolicitudCompraUseCase {
    constructor(private readonly repo: IGestionCompraRepository) {}

    async execute(dto: CreateGestionCompraDto, usuSolicitaNit: number, idEmpresa?: number) {
        const result = await this.repo.create({
            area: dto.area,
            sede: dto.sede,
            cargo_usu_solicita: dto.cargo_usu_solicita,
            gerente_autoriza: dto.gerente_autoriza ?? undefined,
            descri_prod: dto.descri_prod,
            proveedor: dto.proveedor,
            area_cargar: dto.area_cargar,
            urgencia: dto.urgencia,
            fecha_solicitud: new Date(),
            fecha_tentativa: new Date(dto.fecha_tentativa),
            usu_solicita: usuSolicitaNit,
            estado: 1, // Sin revisar
            estado_autorizacion: 1, // Sin autorización (según código legacy)
            con_factura: "No",
            id_empresa: idEmpresa ?? undefined
        });

        if (!result.status || !result.data) {
            throw new BadRequestException(result.message || 'No se pudo crear la solicitud de compra');
        }

        return {
            ...result,
            data: {
                ...result.data,
                id_solicitud: result.data.id_solicitud?.toString() || '',
                fecha_solicitud: result.data.fecha_solicitud.toISOString(),
                fecha_tentativa: result.data.fecha_tentativa.toISOString(),
                fecha_autorizacion: result.data.fecha_autorizacion?.toISOString() || null,
            }
        };
    }
}
