import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITicketRepository } from '../../domain/ticket.repository';
import { reponderTicketDto } from '../dto/update-ticket.dto';
import { EmailService } from '../../../../core/infra/email/email.service';
import { destinatarioCorreoRespuestaTicket } from '../destinos-email-ticket';
import {
  htmlRespuestasTicket,
  plantillaCorreoTicket,
} from '../plantilla-correo-ticket';
import { rutaVerTicket } from '../ruta-ver-ticket';
import {
  getFrontendBaseUrl,
  getTicketsLegacyPostventaBaseUrl,
} from '../../../../core/config/env-urls';

@Injectable()
export class ResponderTicketUseCase {
  private readonly logger = new Logger(ResponderTicketUseCase.name);

  constructor(
    private readonly repo: ITicketRepository,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    ticketId: number,
    dto: reponderTicketDto,
    responderNit?: number,
    empresaId?: number,
  ) {
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

    // Best-effort: el correo no debe bloquear la respuesta HTTP (SMTP puede tardar mucho).
    if (result.status) {
      void this.sendRespuestaEmail(
        ticketId,
        responderNit,
        ticket.usuario_id,
        empresaId,
      ).catch((error) => {
        this.logger.error(
          `Error enviando correo de respuesta para ticket ${ticketId}`,
          error instanceof Error ? error.stack : String(error),
        );
      });
    }

    return result;
  }

  async getRespuestas(ticketId: number) {
    return this.repo.getRespuestas(ticketId);
  }

  private async sendRespuestaEmail(
    ticketId: number,
    responderNit?: number,
    usuarioId?: number,
    empresaId?: number,
  ) {
    const context = await this.repo.getTicketEmailContext(ticketId);
    if (!context) return;

    const to = [
      destinatarioCorreoRespuestaTicket({
        responderNit,
        usuarioId,
        correoUsuario: context.correo_usuario,
        correoEncargado: context.correo_encargado,
      }),
    ];

    const respuestasHtml = htmlRespuestasTicket(context.respuesta, (v) =>
      this.escapeHtml(v),
    );
    const html = plantillaCorreoTicket({
      asunto: this.escapeHtml(context.descripcion),
      respuestasHtml,
      rutaTicket: rutaVerTicket({
        fidPerfil: context.fid_perfil,
        frontendBaseUrl: getFrontendBaseUrl(this.config),
        legacyPostventaBaseUrl: getTicketsLegacyPostventaBaseUrl(this.config),
      }),
    });

    await this.emailService.sendEmail({
      to,
      subject: `Tickets #${ticketId}: Nuevo mensaje`,
      html,
      empresaId,
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
