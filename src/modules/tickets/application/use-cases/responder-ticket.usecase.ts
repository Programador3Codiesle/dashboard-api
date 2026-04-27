import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';
import { reponderTicketDto } from '../dto/update-ticket.dto';
import { EmailService } from '../../../../core/infra/email/email.service';

@Injectable()
export class ResponderTicketUseCase {
  constructor(
    private readonly repo: ITicketRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(ticketId: number, dto: reponderTicketDto, responderNit?: number) {
    const ticket = await this.repo.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    // Obtener la respuesta actual del ticket
    const respuestaActual = await this.repo.getRespuestaActual(ticketId);

    // Formatear la nueva respuesta: NOMBRE: respuesta,
    const nombre = dto.nombre.toUpperCase();
    const nuevaRespuesta = `${nombre}: ${dto.respuesta},`;

    // Concatenar con la respuesta existente si existe
    const respuestaFormateada = respuestaActual
      ? `${respuestaActual}${nuevaRespuesta}`
      : nuevaRespuesta;

    // Si dto.estado viene vacío, null o indefinido, asignar "En Proceso"
    if (!dto.estado || dto.estado.trim() === '') {
      dto.estado = 'En Proceso';
    }

    // Preparar los datos para el repositorio
    const dataRespuesta = {
      respuesta: respuestaFormateada,
      estado: dto.estado,
      fecha_respuesta: dto.fecha_respuesta || new Date(),
    };

    const result = await this.repo.addRespuesta(ticketId, dataRespuesta);

    // Best-effort: no bloquea la respuesta del ticket si falla el correo
    if (result.status) {
      try {
        await this.sendRespuestaEmail(
          ticketId,
          responderNit,
          ticket.encargado_id,
          dto.estado,
        );
      } catch (error) {
        console.error(
          `Error enviando correo de respuesta para ticket ${ticketId}:`,
          error,
        );
      }
    }

    return result;
  }

  async getRespuestas(ticketId: number) {
    return this.repo.getRespuestas(ticketId);
  }

  private async sendRespuestaEmail(
    ticketId: number,
    responderNit?: number,
    encargadoId?: number,
    estado?: string,
  ) {
    const context = await this.repo.getTicketEmailContext(ticketId);
    if (!context) return;

    const isResponderEncargado = Boolean(
      responderNit && encargadoId && responderNit === Number(encargadoId),
    );

    const destinatario = isResponderEncargado
      ? context.correo_usuario?.trim()
      : context.correo_encargado?.trim();

    const to = destinatario
      ? [destinatario]
      : ['programador3@codiesel.co'];

    const respuestasHtml = (context.respuesta || '')
      .split(',')
      .map((resp) => resp.trim())
      .filter(Boolean)
      .map(
        (resp) =>
          `<div style="padding: 10px; margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa;">${this.escapeHtml(resp)}</div>`,
      )
      .join('');

    const estadoTexto =
      estado?.toLowerCase() === 'cerrado'
        ? 'El ticket fue respondido y cerrado.'
        : 'El ticket recibió una nueva respuesta.';

    const html = `
      <div style="font-family: Arial, sans-serif; margin:0; padding:20px; background:#f4f4f4;">
        <div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);">
          <div style="background:#343a40; color:#ffffff; text-align:center; padding: 14px 16px; font-size:18px; font-weight:600;">
            Ticket #${ticketId}: Nuevo mensaje
          </div>
          <div style="padding: 20px; color:#333333; line-height:1.5;">
            <p style="margin:0 0 10px 0;"><strong>Asunto:</strong> ${this.escapeHtml(context.descripcion)}</p>
            <p style="margin:0 0 16px 0;">${estadoTexto}</p>
            ${respuestasHtml || '<p>No hay respuestas registradas.</p>'}
          </div>
          <div style="background:#343a40; color:#ffffff; text-align:center; padding: 10px; font-size:13px;">
            Este correo es informativo. Por favor no responder a este mensaje.
          </div>
        </div>
      </div>
    `;

    await this.emailService.sendEmail({
      to,
      subject: `Tickets #${ticketId}: Nuevo mensaje`,
      html,
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
