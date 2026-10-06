import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  FiltrosOrdenSalida,
  IOrdenSalidaRepository,
} from '../../domain/orden-salida.repository';

@Injectable()
export class ListarOrdenesSalidaUseCase {
  constructor(private readonly repo: IOrdenSalidaRepository) {}

  async execute(filtros: FiltrosOrdenSalida) {
    const jefesPermitidos = new Set<string>([
      '91274670',
      '1005157209',
      '80872884',
      '1065913432',
      '1090449765',
      '1092358562',
      '91259929',
      '1095913265',
      '1092355065',
      '1096957166',
      '1090484563',
      '13741590',
      '63368988',
      '91525308',
      '1098739531',
      '1095809978',
      '91488149',
      '1007421380',
      '1093736472',
      '1095816177',
      '1091655270',
      '1098625558',
      '1090471048',
      '1090445195',
      '91510897',
      '79984087',
      '1098732475',
      '1099367783',
      '1099372035',
      '1128465895',
      '28070692',
      '1090497067',
      '1094241876',
      '79411127',
      '1092338001',
      '1098679322',
      '63289710',
      '63369607',
      '91298113',
      '23423443',
      '23423444',
      '23423445',
      '23423446',
      '63541030',
      '1097304901',
    ]);

    const nitUsuario = filtros.nitUsuario?.trim();
    if (!nitUsuario || !jefesPermitidos.has(nitUsuario)) {
      throw new ForbiddenException(
        'No tiene permisos para acceder a este informe',
      );
    }

    if (
      (filtros.fechaIni && !filtros.fechaFin) ||
      (!filtros.fechaIni && filtros.fechaFin)
    ) {
      throw new BadRequestException('Debe indicar ambas fechas');
    }
    return this.repo.listar(filtros);
  }
}
