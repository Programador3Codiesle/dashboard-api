import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PERFIL_MTTO,
  PERFILES_ADMIN_MTTO,
} from '../../domain/mantenimiento.constants';
import {
  IMantenimientoRepository,
  type CorrectivoListScope,
  type SessionUser,
} from '../../domain/mantenimiento.repository';
import { todaySlash, todayYmd } from '../utils/fechas';
import { num } from '../utils/valores';

function puedeGestionarCorrectivo(user: SessionUser) {
  return user.perfil === PERFIL_MTTO || user.perfil === 26;
}

async function scopeCorrectivo(
  repo: IMantenimientoRepository,
  user: SessionUser,
): Promise<CorrectivoListScope> {
  if (user.perfil === PERFIL_MTTO) {
    return { kind: 'sedes', sedes: await repo.getSedesUsuario(user.nit) };
  }
  if ((PERFILES_ADMIN_MTTO as readonly number[]).includes(user.perfil)) {
    return { kind: 'admins' };
  }
  return { kind: 'jefe', nit: user.nit };
}

@Injectable()
export class ListarCorrectivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser, page: number, limit: number) {
    const p = Math.max(1, page || 1);
    const l = Math.min(100, Math.max(1, limit || 10));
    const offset = (p - 1) * l;
    const scope = await scopeCorrectivo(this.repo, user);
    if (scope.kind === 'sedes' && scope.sedes.length === 0) {
      return { data: [], total: 0, page: p, limit: l };
    }
    const [data, total] = await Promise.all([
      this.repo.listarSolicitudesCorrectivo(scope, l, offset),
      this.repo.countSolicitudesCorrectivo(scope),
    ]);
    return { data, total, page: p, limit: l };
  }
}

@Injectable()
export class ExportarCorrectivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser) {
    const scope = await scopeCorrectivo(this.repo, user);
    if (scope.kind === 'sedes' && scope.sedes.length === 0) return [];
    return this.repo.exportarSolicitudesCorrectivo(scope);
  }
}

@Injectable()
export class CrearSolicitudUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    body: {
      equipoId?: string;
      sedeBodega: string;
      urgencia: string;
      solicitud: string;
    },
    imagen: string | null,
  ) {
    if (!body.solicitud || body.solicitud.length < 15) {
      throw new BadRequestException(
        'La solicitud debe tener mínimo 15 caracteres',
      );
    }
    if (!body.sedeBodega || !body.urgencia) {
      throw new BadRequestException('Sede y urgencia son requeridos');
    }
    const idEquipo =
      body.equipoId && body.equipoId !== 'N/A' ? Number(body.equipoId) : null;
    await this.repo.insertSolicitud({
      jefe: user.nit,
      fecha: todayYmd(),
      solicitud: body.solicitud,
      urgencia: Number(body.urgencia),
      sede: Number(body.sedeBodega),
      imagen,
      idEquipo: idEquipo && Number.isFinite(idEquipo) ? idEquipo : null,
    });
    return { ok: true };
  }
}

@Injectable()
export class IniciarSolicitudUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser, id: number, tiempoEstimado: number) {
    if (!puedeGestionarCorrectivo(user)) {
      throw new BadRequestException('No autorizado');
    }
    const sol = await this.repo.getSolicitudById(id);
    if (!sol) throw new NotFoundException('Solicitud no encontrada');
    await this.repo.iniciarSolicitud(
      id,
      user.nit,
      todaySlash(),
      tiempoEstimado || 1,
    );
    const idEquipo = num(sol.id_equipo);
    if (idEquipo > 0) {
      await this.repo.updateEstadoEquipo(idEquipo, 'Reparacion');
    }
    return { ok: true };
  }
}

@Injectable()
export class FinalizarSolicitudUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    id: number,
    respuesta: string,
    imagenResp: string | null,
  ) {
    if (!puedeGestionarCorrectivo(user)) {
      throw new BadRequestException('No autorizado');
    }
    const sol = await this.repo.getSolicitudById(id);
    if (!sol) throw new NotFoundException('Solicitud no encontrada');
    await this.repo.finalizarSolicitud(id, respuesta, todaySlash(), imagenResp);
    const idEquipo = num(sol.id_equipo);
    if (idEquipo > 0) {
      await this.repo.updateEstadoEquipo(idEquipo, 'Activo');
    }
    return { ok: true };
  }
}

@Injectable()
export class GetSolicitudUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(id: number) {
    return this.repo.getSolicitudById(id);
  }
}

@Injectable()
export class ListarMensajesUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(id: number) {
    return this.repo.listarMensajes(id);
  }
}

@Injectable()
export class AgregarMensajeUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser, id: number, mensaje: string) {
    if (!mensaje?.trim()) throw new BadRequestException('Mensaje vacío');
    await this.repo.insertMensaje({
      mensaje: mensaje.trim(),
      emisor: user.nit,
      idSolicitud: id,
      nombreEmisor: user.nombres,
    });
    return { ok: true };
  }
}

@Injectable()
export class UpdateEquipoSolicitudUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(id: number, idEquipo: number) {
    await this.repo.updateEquipoSolicitud(id, idEquipo);
    return { ok: true };
  }
}
