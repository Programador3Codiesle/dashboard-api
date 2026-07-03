import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getPublicEmailBaseUrl } from '../../../../../core/config/env-urls';
import * as jwt from 'jsonwebtoken';

export interface MpviLinkPayload {
  idCotizacion: number;
  op: number;
  exp?: number;
}

export interface MpviLinkDecodificado {
  idCotizacion: number;
  op: number;
}

const EXPIRACION_DIAS = 30;

@Injectable()
export class MpviLinkService {
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    this.secret =
      this.config.get<string>('JWT_MPVI_LINK_SECRET') ??
      this.config.get<string>('JWT_RESPUESTA_SECRET') ??
      '';
  }

  generarToken(idCotizacion: number, op: number): string {
    if (!this.secret) {
      throw new Error('JWT_MPVI_LINK_SECRET o JWT_RESPUESTA_SECRET no configurado');
    }
    const exp = Math.floor(Date.now() / 1000) + EXPIRACION_DIAS * 24 * 60 * 60;
    const payload: MpviLinkPayload = { idCotizacion, op, exp };
    return jwt.sign(payload, this.secret, { algorithm: 'HS256' });
  }

  validarToken(token: string): MpviLinkDecodificado {
    if (!this.secret) {
      throw new Error('JWT_MPVI_LINK_SECRET o JWT_RESPUESTA_SECRET no configurado');
    }
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as MpviLinkPayload;
      return { idCotizacion: decoded.idCotizacion, op: decoded.op };
    } catch {
      throw new Error('Token MPVI inválido o expirado');
    }
  }

  urlImprimirCotizacion(token: string): string {
    const base = getPublicEmailBaseUrl(this.config);
    return `${base}/dashboard/taller/mpvi/cotizacion/imprimir?token=${encodeURIComponent(token)}`;
  }

  urlFirmarCotizacion(token: string): string {
    const base = getPublicEmailBaseUrl(this.config);
    return `${base}/dashboard/taller/mpvi/cotizacion/firmar?token=${encodeURIComponent(token)}`;
  }
}
