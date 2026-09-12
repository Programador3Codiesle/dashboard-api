import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CreateGestionCompraDto } from '../dto/create-gestion-compra.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import {
  DESTINATARIOS_NUEVA_SOLICITUD_COMPRAS,
  parseListaEmails,
} from '../destinos-email-compras';

@Injectable()
export class CrearSolicitudCompraUseCase {
  private readonly logger = new Logger(CrearSolicitudCompraUseCase.name);

  constructor(
    private readonly repo: IGestionCompraRepository,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    dto: CreateGestionCompraDto,
    usuSolicitaNit: number,
    idEmpresa?: number,
  ) {
    const result = await this.repo.create({
      area: dto.area,
      sede: dto.sede,
      cargo_usu_solicita: dto.cargo_usu_solicita,
      gerente_autoriza: dto.gerente_autoriza ?? undefined,
      descri_prod: dto.descri_prod,
      proveedor: dto.proveedor,
      area_cargar: dto.area_cargar,
      urgencia: dto.urgencia,
      fecha_solicitud: new Date(),
      fecha_tentativa: new Date(dto.fecha_tentativa),
      usu_solicita: usuSolicitaNit,
      estado: 1, // Sin revisar
      estado_autorizacion: 1, // Sin autorización (según código legacy)
      con_factura: 'No',
      id_empresa: idEmpresa ?? undefined,
    });

    if (!result.status || !result.data) {
      throw new BadRequestException(
        result.message || 'No se pudo crear la solicitud de compra',
      );
    }

    try {
      await this.notificarNuevaSolicitud(
        result.data.id_solicitud?.toString() || '',
        idEmpresa,
      );
    } catch (e) {
      this.logger.warn(
        `Alta de solicitud: error inesperado enviando correo: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }

    return {
      ...result,
      data: {
        ...result.data,
        id_solicitud: result.data.id_solicitud?.toString() || '',
        fecha_solicitud: result.data.fecha_solicitud.toISOString(),
        fecha_tentativa: result.data.fecha_tentativa.toISOString(),
        fecha_autorizacion:
          result.data.fecha_autorizacion?.toISOString() || null,
      },
    };
  }

  /** Compras.php insert_solicitud: aviso a compras@codiesel.co (best-effort). */
  private async notificarNuevaSolicitud(
    idSolicitud: string,
    empresaId?: number,
  ): Promise<void> {
    const to = parseListaEmails(
      this.config.get<string>('EMAIL_NUEVA_SOLICITUD_COMPRAS'),
      DESTINATARIOS_NUEVA_SOLICITUD_COMPRAS,
    );
    const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Nueva Solicitud de Compra</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;">Se ha generado una nueva Solicitud de Compra</p>
                <p style="margin:0;"><strong>Solicitud:</strong> ${idSolicitud || '-'}</p>
              </div>
            </div>
          </div>
        `;
    const mailResult = await this.emailService.sendEmail({
      to,
      subject: 'Nueva Solicitud de Compra',
      html,
      empresaId,
    });
    if (!mailResult.ok) {
      this.logger.warn(
        `Alta de solicitud ${idSolicitud}: no se pudo enviar correo (${mailResult.error})`,
      );
    }
  }
}
