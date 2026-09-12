import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailService } from '../../../../core/infra/email/email.service';
import { IUserRepository } from '../../domain/user.repository';
import {
  AUTH_MESSAGES,
  CODIESEL_EMPRESA_ID,
} from '../../domain/auth.constants';

const CODIGO_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generarCodigoVerificacion(): string {
  let codigo = '';
  for (let i = 0; i < 4; i++) {
    codigo += CODIGO_CHARS[crypto.randomInt(0, CODIGO_CHARS.length)];
  }
  return codigo;
}

@Injectable()
export class SolicitarCodigoRecuperacionUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    nit: number,
  ): Promise<{ ok: true; mail: string } | { ok: false; message: string }> {
    const n = await this.userRepo.countUsuariosByNit(nit);
    if (n !== 1) {
      return { ok: false, message: AUTH_MESSAGES.recuperarError };
    }

    const codigo = generarCodigoVerificacion();
    const updated = await this.userRepo.updateCodVerificacion(nit, codigo);
    if (!updated) {
      return { ok: false, message: AUTH_MESSAGES.recuperarError };
    }

    const mail = await this.userRepo.findCorreoCorporativoCodiesel(nit);
    if (!mail) {
      return { ok: false, message: AUTH_MESSAGES.recuperarError };
    }

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body>
  <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:16px;">
    <h2>Código de verificación INTRANET POSVENTA</h2>
    <p>Su Código de verificación es: ${codigo}</p>
  </div>
</body>
</html>`;

    const sent = await this.emailService.sendEmail({
      to: [mail],
      subject: 'Codigo de verificacion INTRANET POSVENTA',
      html,
      empresaId: CODIESEL_EMPRESA_ID,
    });

    if (!sent.ok) {
      return { ok: false, message: AUTH_MESSAGES.recuperarError };
    }

    return { ok: true, mail };
  }
}
