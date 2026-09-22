import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IMantenimientoRepository,
  type SessionUser,
} from '../../domain/mantenimiento.repository';
import { todayYmd } from '../utils/fechas';
import { assertPuedeMutarEquipos } from '../utils/permiso-equipos';

@Injectable()
export class OrdenPreventivoDesdeEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    body: {
      codigoEquipoMp: string;
      f_requerida: string;
      tiempo_estimado: number;
      descripcionMp: string;
    },
  ) {
    if (!body.codigoEquipoMp || !body.f_requerida || !body.descripcionMp) {
      throw new BadRequestException('Campos incompletos');
    }
    await this.repo.insertOrdenPreventiva({
      codigo: body.codigoEquipoMp,
      responsable: user.nit,
      fechaSolicitud: todayYmd(),
      fechaRequerida: body.f_requerida,
      descripcion: body.descripcionMp,
      tiempoEstimado: Number(body.tiempo_estimado) || 1,
    });
    return { ok: true };
  }
}

@Injectable()
export class SolicitarRetiroUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    equipoId: number,
    motivo: string,
    imagen: string,
  ) {
    assertPuedeMutarEquipos(user);
    const eq = await this.repo.getEquipoById(equipoId);
    if (!eq) throw new NotFoundException('Equipo no encontrado');
    if (!motivo?.trim()) throw new BadRequestException('Motivo requerido');

    const fecha = todayYmd();
    const idRetiro = await this.repo.insertRetiro({
      equipoId,
      nitSolicita: user.nit,
      motivo,
      imagen,
      fecha,
    });
    await this.repo.updateEstadoEquipo(equipoId, 'inactivo');
    return { ok: true, id: idRetiro };
  }
}
