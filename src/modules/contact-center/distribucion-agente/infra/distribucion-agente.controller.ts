import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { assertCodieselEmpresa } from '../../shared/utils/assert-codiesel.util';
import { getContactCenterSessionUser } from '../../shared/utils/contact-center-user.util';
import { DistribucionAgenteFacade } from '../application/distribucion-agente.facade';

@UseGuards(JwtAuthGuard)
@Controller('contact-center/distribucion-agente')
export class DistribucionAgenteController {
  constructor(private readonly facade: DistribucionAgenteFacade) {}

  @Get('ga-actuales')
  gaActuales(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number; role?: number; nit?: number };
    },
  ) {
    assertCodieselEmpresa(req);
    const { nit } = getContactCenterSessionUser(req);
    return this.facade.getGaActuales(nit);
  }
}
