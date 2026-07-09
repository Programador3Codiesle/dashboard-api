import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EntradasVariasEmailService } from '../../shared/application/entradas-varias-email.service';
import { IEntradasVariasRepository } from '../../shared/domain/entradas-varias.repository';
import {
  BuscarOrdenEvDto,
  CrearSolicitudEvDto,
  ValidarRepuestoEvDto,
} from './dto/entradas-varias.dto';

@Injectable()
export class EntradasVariasFacade {
  constructor(
    private readonly repo: IEntradasVariasRepository,
    private readonly emailService: EntradasVariasEmailService,
  ) {}

  listarBodegas() {
    return this.repo.listarBodegas();
  }

  async buscarOrden(dto: BuscarOrdenEvDto) {
    const orden = await this.repo.obtenerOrden(dto.nOrden);
    if (!orden) {
      throw new BadRequestException(
        `No se encontró información sobre el número de orden: ${dto.nOrden}`,
      );
    }
    return orden;
  }

  async validarRepuesto(dto: ValidarRepuestoEvDto) {
    const repuesto = await this.repo.validarRepuesto(dto.codigo);
    if (!repuesto) {
      throw new BadRequestException(
        `No se encontró información sobre el repuesto: ${dto.codigo}`,
      );
    }
    return repuesto;
  }

  async crearSolicitud(dto: CrearSolicitudEvDto, userId: number) {
    if (!userId) throw new UnauthorizedException('Sesión inválida');

    const referencias = new Set<string>();
    for (const r of dto.repuestos) {
      if (referencias.has(r.referencia)) {
        throw new BadRequestException(
          `La referencia ${r.referencia} está duplicada en la solicitud`,
        );
      }
      referencias.add(r.referencia);
      const valid = await this.repo.validarRepuesto(r.referencia);
      if (!valid) {
        throw new BadRequestException(
          `Repuesto inválido o sin inventario: ${r.referencia}`,
        );
      }
    }

    const idSolicitud = await this.repo.crearSolicitud({
      nOrden: dto.nOrden,
      userRegister: userId,
      obs: dto.obs,
      repuestos: dto.repuestos,
    });

    const solicitud = await this.repo.obtenerSolicitudPorId(idSolicitud);
    let emailEnviado = false;
    if (solicitud) {
      emailEnviado = await this.emailService.notificarNuevaSolicitud(
        solicitud,
        idSolicitud,
      );
    }

    return {
      idSolicitud,
      message: emailEnviado
        ? 'Solicitud realizada con éxito'
        : 'Solicitud realizada con éxito. No se pudo enviar correo de autorización.',
    };
  }
}
