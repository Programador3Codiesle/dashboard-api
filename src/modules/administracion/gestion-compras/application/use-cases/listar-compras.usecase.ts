import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { FiltrosComprasDto } from '../dto/filtros-compras.dto';
import { GestionCompraEntity } from '../../domain/gestion-compra.entity';

@Injectable()
export class ListarComprasUseCase {
  constructor(private readonly repo: IGestionCompraRepository) {}

  async execute(filtros?: FiltrosComprasDto) {
    const result = await this.repo.listar({
      ...filtros,
      pagina: filtros?.pagina || 1,
      limite: filtros?.limite || 10,
    });

    // Convertir BigInt a string y formatear fechas en horario de Bogotá para serialización JSON
    return {
      items: result.items.map((item) => {
        const entity = item as GestionCompraEntity & {
          usuario_reg?: string;
          nit_usu_reg?: number;
          gerente?: string;
          nit_gerente?: number;
          dias_gest?: number;
        };
        return {
          id_solicitud: entity.id_solicitud?.toString() || '',
          // YYYY-MM-DD en zona America/Bogota
          fecha_solicitud: entity.fecha_solicitud.toLocaleDateString('sv-SE', {
            timeZone: 'America/Bogota',
          }),
          area: entity.area,
          sede: entity.sede,
          usu_solicita: entity.usu_solicita,
          cargo_usu_solicita: entity.cargo_usu_solicita,
          gerente_autoriza: entity.gerente_autoriza,
          descri_prod: entity.descri_prod,
          caracteristicas: entity.caracteristicas || null,
          proveedor: entity.proveedor || null,
          area_cargar: entity.area_cargar || null,
          urgencia: entity.urgencia,
          fecha_tentativa: entity.fecha_tentativa.toLocaleDateString('sv-SE', {
            timeZone: 'America/Bogota',
          }),
          estado: entity.estado,
          fecha_autorizacion: entity.fecha_autorizacion
            ? entity.fecha_autorizacion.toLocaleDateString('sv-SE', {
                timeZone: 'America/Bogota',
              })
            : null,
          cotizacion_file: entity.cotizacion_file || null,
          estado_autorizacion: entity.estado_autorizacion,
          con_factura: entity.con_factura || null,
          // Campos adicionales del JOIN
          usuario_reg: entity.usuario_reg || null,
          nit_usu_reg: entity.nit_usu_reg || null,
          gerente: entity.gerente || null,
          nit_gerente: entity.nit_gerente || null,
          dias_gest: entity.dias_gest || 0,
        };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
