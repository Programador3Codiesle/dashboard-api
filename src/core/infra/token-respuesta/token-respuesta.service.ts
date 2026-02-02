import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export type TipoAutorizacion = 'gestion-compra' | 'nuevo-ausentismo' | 'tiempo-suplementario';

export interface PayloadTokenRespuesta {
  id: number | string;
  tipo: TipoAutorizacion;
  exp?: number;
}

export interface TokenRespuestaDecodificado {
  id: number | string;
  tipo: TipoAutorizacion;
}

const EXPIRACION_DIAS = 7;

@Injectable()
export class TokenRespuestaService {
  private readonly secret: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('JWT_RESPUESTA_SECRET') ?? '';
    this.appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3001';
  }

  /**
   * Genera un JWT para links de autorización por correo.
   * id se serializa como number (BigInt no es JSON-serializable; para gestion-compra y ausentismo se pasa como number).
   */
  generarToken(id: number | bigint, tipo: TipoAutorizacion): string {
    if (!this.secret) {
      throw new Error('JWT_RESPUESTA_SECRET no configurado');
    }
    const exp = Math.floor(Date.now() / 1000) + EXPIRACION_DIAS * 24 * 60 * 60;
    const payload: PayloadTokenRespuesta = {
      id: typeof id === 'bigint' ? Number(id) : id,
      tipo,
      exp,
    };
    return jwt.sign(payload, this.secret, { algorithm: 'HS256' });
  }

  /**
   * Valida el token y devuelve { id, tipo }. Lanza si es inválido o expirado.
   */
  validarToken(token: string): TokenRespuestaDecodificado {
    if (!this.secret) {
      throw new Error('JWT_RESPUESTA_SECRET no configurado');
    }
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] }) as PayloadTokenRespuesta;
      return { id: decoded.id, tipo: decoded.tipo };
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Construye la URL del endpoint de respuesta con token y accion (aprobar | rechazar).
   * El backend no usa prefijo /api; la ruta es /administracion/responder.
   */
  urlResponder(token: string, accion: 'aprobar' | 'rechazar'): string {
    const base = this.appUrl.endsWith('/') ? this.appUrl.slice(0, -1) : this.appUrl;
    return `${base}/administracion/responder?token=${encodeURIComponent(token)}&accion=${accion}`;
  }
}
