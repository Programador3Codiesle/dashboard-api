import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PERFILES_EDITAN_PRESUPUESTO } from '../../domain/constants/tcm-tipo-ids.constants';
import { ConsultarPresupuestoResponseEntity } from '../../domain/entities/presupuesto.entity';
import { IPresupuestoRepository } from '../../domain/repositories/presupuesto.repository.interface';
import { ConsultarPresupuestoDto } from '../dto/consultar-presupuesto.dto';
import { generateTable } from '../utils/presupuesto-table.calculator';
import { mapMatrizToTabla } from '../utils/presupuesto-table.mapper';

@Injectable()
export class ConsultarPresupuestoUseCase {
  constructor(private readonly repository: IPresupuestoRepository) {}

  async execute(
    dto: ConsultarPresupuestoDto,
    perfilUsuario: number | null,
  ): Promise<ConsultarPresupuestoResponseEntity> {
    const anio = new Date().getFullYear();
    const tipoVh = dto.idCategoria;
    const sedeId = dto.idSede;
    const puedeEditar =
      perfilUsuario != null &&
      (PERFILES_EDITAN_PRESUPUESTO as readonly number[]).includes(
        perfilUsuario,
      );
    const mesActualIndex = new Date().getMonth();

    const tablas: ConsultarPresupuestoResponseEntity['tablas'] = [];

    if (dto.idTipo != null && dto.idTipo > 0) {
      const tipo = await this.repository.obtenerTipoPorId(dto.idTipo);
      if (!tipo) {
        throw new NotFoundException(
          'El tipo de presupuesto seleccionado no existe.',
        );
      }

      const datos = await this.repository.obtenerPresupuesto({
        anio,
        sedeId,
        tipoVh,
        tipoId: dto.idTipo,
      });

      const matriz = generateTable(datos);
      tablas.push(
        mapMatrizToTabla(
          tipo.nombre,
          matriz,
          { anio, sedeId, tipoVh, tipoId: dto.idTipo },
          true,
          puedeEditar,
        ),
      );
    } else {
      const catalogos = await this.repository.obtenerCatalogos();

      for (const tipo of catalogos.tipos) {
        const datos = await this.repository.obtenerPresupuesto({
          anio,
          sedeId,
          tipoVh,
          tipoId: tipo.id,
        });

        const matriz = generateTable(datos);
        tablas.push(
          mapMatrizToTabla(
            tipo.nombre,
            matriz,
            { anio, sedeId, tipoVh, tipoId: tipo.id },
            true,
            puedeEditar,
          ),
        );
      }

      const datosTcm = await this.repository.obtenerSumaTcmTotal({
        anio,
        sedeId,
        tipoVh,
      });

      const matrizTcm = generateTable(datosTcm);
      tablas.push(
        mapMatrizToTabla(
          'TOTAL TCM',
          matrizTcm,
          { anio, sedeId, tipoVh },
          false,
          puedeEditar,
        ),
      );
    }

    if (tablas.length === 0) {
      throw new BadRequestException(
        'No se encontraron datos para los filtros.',
      );
    }

    return {
      puedeEditar,
      mesActualIndex,
      tablas,
    };
  }
}
