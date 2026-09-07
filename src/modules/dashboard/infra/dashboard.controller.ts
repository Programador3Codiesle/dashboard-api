import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { GetDashboardUseCase } from '../application/use-cases/get-dashboard.usecase';
import { DashboardCacheInterceptor } from './dashboard-cache.interceptor';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  @UseInterceptors(DashboardCacheInterceptor)
  @CacheTTL(60_000)
  async getDashboard(
    @Req() req: Request,
    @Query('idsede') idsede?: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
    @Query('empresa') empresa?: string,
  ) {
    const user = (
      req as Request & {
        user?: { sub?: string; nit?: number; role?: string | number };
      }
    ).user;
    const userId = String(user?.sub ?? '');
    const nitUsuario = Number(user?.nit ?? 0);
    const perfil = user?.role ?? 0;
    const idsedeNum =
      idsede != null && idsede !== '' ? Number(idsede) : undefined;
    const mesNum = mes != null && mes !== '' ? Number(mes) : undefined;
    const anoNum = ano != null && ano !== '' ? Number(ano) : undefined;
    const empresaNum =
      empresa != null && empresa !== '' ? Number(empresa) : undefined;
    const idEmpresaNum =
      empresaNum != null && Number.isFinite(empresaNum) && empresaNum > 0
        ? empresaNum
        : undefined;
    return this.getDashboardUseCase.execute(
      userId,
      nitUsuario,
      perfil,
      idsedeNum,
      mesNum,
      anoNum,
      idEmpresaNum,
    );
  }
}
