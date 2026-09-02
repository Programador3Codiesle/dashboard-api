import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../../core/infra/email/email.service';
import {
  IMantenimientoRepository,
  type SessionUser,
} from '../../domain/mantenimiento.repository';
import { todayYmd } from '../utils/fechas';

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
  constructor(
    private readonly repo: IMantenimientoRepository,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    user: SessionUser,
    equipoId: number,
    jefeNit: string,
    motivo: string,
    imagen: string,
  ) {
    const eq = await this.repo.getEquipoById(equipoId);
    if (!eq) throw new NotFoundException('Equipo no encontrado');

    const idRetiro = await this.repo.insertRetiro({
      equipoId,
      nitSolicita: user.nit,
      motivo,
      imagen,
      fecha: todayYmd(),
    });

    const base = this.config.get<string>('APP_URL') ?? 'http://localhost:4000';
    const accept = `${base}/mantenimiento/publico/autorizar-retiro?id=${idRetiro}&nit_user_resp=${encodeURIComponent(jefeNit)}`;
    const reject = `${base}/mantenimiento/publico/rechazar-retiro?id=${idRetiro}&nit_user_resp=${encodeURIComponent(jefeNit)}`;

    const correoJefe = await this.repo.getJefeCorreo(jefeNit);
    const to = [correoJefe, 'programador3@codiesel.com'].filter(
      Boolean,
    ) as string[];

    const html = `<p>Buen día</p>
      <p>La persona <strong>${user.nombres}</strong> ha solicitado el retiro del activo fijo
      <strong>${eq.codigo}</strong> (${eq.nombre_equipo}) por motivo:
      <strong>${motivo}</strong></p>
      <p><a href="${accept}">Aceptar</a> &nbsp; <a href="${reject}">Rechazar</a></p>`;

    if (to.length) {
      await this.email.sendEmail({
        to,
        subject: `Solicitud retiro de equipo: ${eq.nombre_equipo}`,
        html,
      });
    }
    return { ok: true, id: idRetiro };
  }
}
