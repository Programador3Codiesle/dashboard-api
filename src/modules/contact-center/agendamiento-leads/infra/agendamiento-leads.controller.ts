import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { getContactCenterSessionUser } from '../../shared/utils/contact-center-user.util';
import { AgendamientoLeadsFacade } from '../application/agendamiento-leads.facade';
import {
  AsignarLeadsDto,
  GestionarLeadDto,
  ListarLeadsDto,
} from '../application/dto/agendamiento-leads.dto';

type CcRequest = {
  cookies?: Record<string, string>;
  user?: { sub?: number; role?: number; nit?: number };
};

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('contact-center/agendamiento-leads')
export class AgendamientoLeadsController {
  constructor(private readonly facade: AgendamientoLeadsFacade) {}

  @Post('listar')
  listar(@Req() req: CcRequest, @Body() dto: ListarLeadsDto) {
    const { userId, perfil } = getContactCenterSessionUser(req);
    return this.facade.listar(dto, userId, perfil);
  }

  @Post('asignar')
  asignar(@Body() dto: AsignarLeadsDto) {
    return this.facade.asignar(dto);
  }

  @Post('gestionar')
  gestionar(@Body() dto: GestionarLeadDto) {
    return this.facade.gestionar(dto);
  }

  @Get('motivos')
  motivos() {
    return this.facade.getMotivos();
  }

  @Get('agentes-asignacion')
  agentesAsignacion() {
    return this.facade.getAgentesAsignacion();
  }

  @Get('export')
  async export(): Promise<StreamableFile> {
    const buffer = await this.facade.exportarExcel();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="LEADS POSTVENTA.xlsx"',
    });
  }
}
