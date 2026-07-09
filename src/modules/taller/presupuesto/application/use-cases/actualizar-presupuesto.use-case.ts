import { ForbiddenException, Injectable } from '@nestjs/common';
import { PERFILES_EDITAN_PRESUPUESTO } from '../../domain/constants/tcm-tipo-ids.constants';
import { IPresupuestoRepository } from '../../domain/repositories/presupuesto.repository.interface';
import { ActualizarPresupuestoDto } from '../dto/actualizar-presupuesto.dto';

@Injectable()
export class ActualizarPresupuestoUseCase {
  constructor(private readonly repository: IPresupuestoRepository) {}

  async execute(
    dto: ActualizarPresupuestoDto,
    perfilUsuario: number | null,
    userId: number,
  ): Promise<{ message: string }> {
    const puedeEditar =
      perfilUsuario != null &&
      (PERFILES_EDITAN_PRESUPUESTO as readonly number[]).includes(
        perfilUsuario,
      );

    if (!puedeEditar) {
      throw new ForbiddenException(
        'No tiene permisos para editar el presupuesto.',
      );
    }

    await this.repository.actualizarPresupuesto(
      {
        anio: dto.anio,
        mes: dto.mes,
        sedeId: dto.sedeId,
        tipoId: dto.tipoId,
        tipoVh: dto.tipoVh,
      },
      dto.campo,
      dto.valor,
      userId,
    );

    return { message: 'Presupuesto actualizado correctamente.' };
  }
}
