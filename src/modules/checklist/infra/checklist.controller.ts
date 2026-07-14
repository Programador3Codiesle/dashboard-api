import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { ChecklistGuardarFacade } from '../application/checklist-guardar.facade';
import { GuardarChecklistDto } from '../application/dto/guardar-checklist.dto';

type AuthRequest = {
  user?: { nit?: string | number };
};

@UseGuards(JwtAuthGuard)
@Controller('checklist')
export class ChecklistController {
  constructor(private readonly facade: ChecklistGuardarFacade) {}

  @Post('guardar')
  guardar(@Req() req: AuthRequest, @Body() dto: GuardarChecklistDto) {
    const nit = Number(req.user?.nit ?? 0);
    return this.facade.guardar(dto, nit);
  }
}
