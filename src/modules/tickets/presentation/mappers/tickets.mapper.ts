import { TicketEntity } from "../../domain/ticket.entity";

export class TicketsMapper {


    static mapToEntity(r: any): TicketEntity {
        console.log(r);
        
        return new TicketEntity({
            id: Number(r.id),
            usuario_id: r.usuario, // La query devuelve 'usuario' (nit), mapeamos a usuario_id
            prioridad: r.prioridad,
            tipo_soporte: r.tipo_soporte,
            fecha_creacion: r.fecha_creacion,
            estado: r.estado,
            nombre_usuario: r.nombre_usuario,
            nombre_encargado: r.nombre_encargado,
            empresa: r.idEmpresas,
            // Campos que no vienen en esta query específica pero son parte de la entidad
            // Se pueden dejar undefined gracias al Partial del constructor, o asignar valores por defecto si se requiere
        });
    }
}   