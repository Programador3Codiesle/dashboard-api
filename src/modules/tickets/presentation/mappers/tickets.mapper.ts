import { TicketEntity } from '../../domain/ticket.entity';
import { nombreEncargadoVisible } from '../../application/asignar-encargado-tipo-soporte';

export class TicketsMapper {
  static mapToEntity(r: any): TicketEntity {
    return new TicketEntity({
      id: Number(r.id),
      usuario_id: r.usuario, // La query devuelve 'usuario' (nit), mapeamos a usuario_id
      prioridad: r.prioridad,
      tipo_soporte: r.tipo_soporte,
      fecha_creacion: r.fecha_creacion,
      fecha_respuesta: r.fecha_respuesta ?? null,
      estado: r.estado,
      nombre_usuario: r.nombre_usuario,
      encargado_id: r.encargado != null ? Number(r.encargado) : undefined,
      nombre_encargado: nombreEncargadoVisible(r.encargado, r.nombre_encargado),
      empresa: r.idEmpresas,
      sede: r.sede || undefined,
      extension: r.extension || undefined,
      // Campos que no vienen en esta query específica pero son parte de la entidad
      // Se pueden dejar undefined gracias al Partial del constructor, o asignar valores por defecto si se requiere
    });
  }
}
