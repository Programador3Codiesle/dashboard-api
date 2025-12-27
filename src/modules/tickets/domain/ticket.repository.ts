
import { TicketEntity, RespuestaTicketEntity } from './ticket.entity';

export abstract class ITicketRepository {
    abstract create(data: Partial<TicketEntity>): Promise<{status: boolean, message: string, data: TicketEntity | null}>;
    abstract update(id: number, data: Partial<TicketEntity>): Promise<{status: boolean, message: string}>;
    abstract findById(id: number): Promise<TicketEntity | null>;
    abstract findByUsuario(userId: number): Promise<TicketEntity[]>;
    abstract findActivos(): Promise<TicketEntity[]>;
    abstract findFinalizados(): Promise<TicketEntity[]>;
    abstract getRespuestaActual(ticketId: number): Promise<string | null>;
    abstract addRespuesta(ticket: number, data: Partial<RespuestaTicketEntity>): Promise<{status: boolean, message: string}>;
    abstract getRespuestas(ticketId: number): Promise<RespuestaTicketEntity[]>;
}
