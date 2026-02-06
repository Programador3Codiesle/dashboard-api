import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { GetDashboardUseCase } from '../application/use-cases/get-dashboard.usecase';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  async getDashboard(@Req() req: Request) {
    const user = (req as any).user as { sub: string; nit: number; role: string | number };
    const userId = String(user?.sub ?? '');
    const nitUsuario = Number(user?.nit ?? 0);
    const perfil = user?.role ?? 0;
    return this.getDashboardUseCase.execute(userId, nitUsuario, perfil);
  }
}
