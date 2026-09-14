import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { asignarEncargadoPorTipoSoporte } from '../asignar-encargado-tipo-soporte';

@Injectable()
export class CreateTicketUseCase {
  constructor(private readonly repo: ITicketRepository) {}

  async execute(dto: CreateTicketDto) {
    const asignacion = asignarEncargadoPorTipoSoporte(dto.tipo_soporte);
    return this.repo.create({
      tipo_soporte: dto.tipo_soporte,
      anydesk: dto.anydesk,
      descripcion: dto.descripcion,
      sede: dto.sede,
      extension: dto.extension,
      archivo_url: dto.archivo_url,
      usuario_id: dto.usuario_id,
      estado: 'activo',
      prioridad: '',
      encargado_id: asignacion?.encargadoNit,
      area: asignacion?.area ?? 'sistemas',
    });
  }
}
