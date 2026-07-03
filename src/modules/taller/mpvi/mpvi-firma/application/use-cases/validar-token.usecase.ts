import { Injectable } from '@nestjs/common';
import { MpviLinkService } from '../../../mpvi-shared/application/mpvi-link.service';

@Injectable()
export class ValidarTokenUseCase {
  constructor(private readonly linkService: MpviLinkService) {}

  execute(token: string) {
    const decoded = this.linkService.validarToken(token);
    return { idCotizacion: decoded.idCotizacion, op: decoded.op };
  }
}
