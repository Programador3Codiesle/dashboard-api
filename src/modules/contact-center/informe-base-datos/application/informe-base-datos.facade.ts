import { BadRequestException, Injectable } from '@nestjs/common';
import { ConsultarInformeBaseDatosDto } from './dto/informe-base-datos.dto';
import { InformeBaseDatosRepository } from '../infra/repositories/informe-base-datos.repository';

@Injectable()
export class InformeBaseDatosFacade {
  constructor(private readonly repo: InformeBaseDatosRepository) {}

  async consultar(dto: ConsultarInformeBaseDatosDto) {
    if (dto.tipoInfDB !== '2' && !dto.dateStart) {
      throw new BadRequestException('dateStart es obligatorio para este tipo de informe');
    }
    if (dto.dateStart && dto.dateEnd && dto.dateEnd < dto.dateStart) {
      throw new BadRequestException('La fecha hasta no puede ser menor que la fecha desde');
    }

    const rows = await this.repo.consultar(dto);

    if (rows.length === 0) {
      return {
        status: false,
        data: [],
        message: 'No se encontraron resultados.',
        title: 'Atención',
        icon: 'warning',
      };
    }

    return {
      status: true,
      data: rows,
      message: 'Datos encontrados.',
      title: 'Éxito',
      icon: 'success',
    };
  }
}
