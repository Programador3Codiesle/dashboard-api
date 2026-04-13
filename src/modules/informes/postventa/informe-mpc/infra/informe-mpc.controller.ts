import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { MpcFacade } from '../application/mpc.facade';
import { MpcInformeRowEntity } from '../domain/mpc.entity';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/mpc')
export class InformeMpcController {
  constructor(private readonly facade: MpcFacade) {}

  @Get()
  listar(): Promise<MpcInformeRowEntity[]> {
    return this.facade.listar();
  }

  @Post('cambiar-estado-caso-especial')
  async cambiarEstadoCasoEspecial(
    @Req() req: any,
    @Body() body: { placa: string; estado: number },
  ): Promise<{ ok: boolean }> {
    const userId =
      req.user?.nit != null ? Number(req.user.nit) : req.user?.id_usuario;

    await this.facade.cambiarEstadoCasoEspecial(
      body.placa,
      body.estado,
      userId,
    );
    return { ok: true };
  }
}
