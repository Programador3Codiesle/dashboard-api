
export class TicketEntity {
    // Obligatorios: Siempre deben existir en un ticket válido
    id: number;
    tipo_soporte: string;
    descripcion: string;
    empresa?: number[];
    prioridad: string;
    estado: string;
    fecha_creacion: Date;
    usuario_id: number;
    nombre_usuario: string;
    area: string;

    // Opcionales: Pueden ser null o no existir en ciertos momentos
    anydesk?: string;
    archivo_url?: string;
    encargado_id?: number;
    nombre_encargado?: string;
    respuestas?: string;

    constructor(partial: Partial<TicketEntity>) {
        Object.assign(this, partial);
    }
}

export class RespuestaTicketEntity {
    id: number;
    ticket_id: number;
    usuario_id: number;
    mensaje: string;
    archivo_url?: string;
    fecha: Date;
    encargado_id?: number;
    prioridad?: string;
    estado?: string;
    respuesta?: string;
    fecha_respuesta?: Date;

    constructor(partial: Partial<RespuestaTicketEntity>) {
        Object.assign(this, partial);
    }
}
