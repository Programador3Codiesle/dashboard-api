import { TicketEntity, RespuestaTicketEntity } from './ticket.entity';

export type TicketEmailContext = {
  id_ticket: number;
  descripcion: string;
  respuesta: string | null;
  correo_usuario: string | null;
  correo_encargado: string | null;
};

export abstract class ITicketRepository {
  abstract create(
    data: Partial<TicketEntity>,
  ): Promise<{ status: boolean; message: string; data: TicketEntity | null }>;
  abstract update(
    id: number,
    data: Partial<TicketEntity>,
  ): Promise<{ status: boolean; message: string }>;
  abstract findById(id: number): Promise<TicketEntity | null>;
  abstract findByUsuario(userId: number): Promise<TicketEntity[]>;
  abstract findActivos(page?: number, limit?: number): Promise<TicketEntity[]>;
  abstract findFinalizados(
    page?: number,
    limit?: number,
  ): Promise<TicketEntity[]>;
  abstract getRespuestaActual(ticketId: number): Promise<string | null>;
  abstract addRespuesta(
    ticket: number,
    data: Partial<RespuestaTicketEntity>,
  ): Promise<{ status: boolean; message: string }>;
  abstract getRespuestas(ticketId: number): Promise<RespuestaTicketEntity[]>;
  abstract getTicketEmailContext(
    ticketId: number,
  ): Promise<TicketEmailContext | null>;
}
