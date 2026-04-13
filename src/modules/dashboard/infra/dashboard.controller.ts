import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { GetDashboardUseCase } from '../application/use-cases/get-dashboard.usecase';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  async getDashboard(
    @Req() req: Request,
    @Query('idsede') idsede?: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    const user = (req as any).user as {
      sub: string;
      nit: number;
      role: string | number;
    };
    const userId = String(user?.sub ?? '');
    const nitUsuario = Number(user?.nit ?? 0);
    const perfil = user?.role ?? 0;
    const idsedeNum =
      idsede != null && idsede !== '' ? Number(idsede) : undefined;
    const mesNum = mes != null && mes !== '' ? Number(mes) : undefined;
    const anoNum = ano != null && ano !== '' ? Number(ano) : undefined;
    return this.getDashboardUseCase.execute(
      userId,
      nitUsuario,
      perfil,
      idsedeNum,
      mesNum,
      anoNum,
    );
  }
}
