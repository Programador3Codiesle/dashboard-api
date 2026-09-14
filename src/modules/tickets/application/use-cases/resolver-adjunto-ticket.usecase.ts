import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import {
  getAppBaseUrl,
  getTicketsLegacyPostventaBaseUrl,
} from '../../../../core/config/env-urls';
import {
  nombreAdjuntoTicket,
  rutaDiscoAdjuntoNueva,
  urlAdjuntoLegado,
  urlAdjuntoNuevaApp,
} from '../adjunto-ticket';

@Injectable()
export class ResolverAdjuntoTicketUseCase {
  constructor(private readonly config: ConfigService) {}

  execute(stored?: string): string {
    const nombre = nombreAdjuntoTicket(stored);
    if (!nombre) {
      throw new BadRequestException('Archivo de ticket inválido');
    }
    const enNueva = existsSync(rutaDiscoAdjuntoNueva(process.cwd(), nombre));
    if (enNueva) {
      return urlAdjuntoNuevaApp(getAppBaseUrl(this.config), nombre);
    }
    return urlAdjuntoLegado(
      getTicketsLegacyPostventaBaseUrl(this.config),
      nombre,
    );
  }
}
