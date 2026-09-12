import {
  Controller,
  Get,
  Query,
  UseGuards,
  StreamableFile,
  Req,
} from '@nestjs/common';
import { InformeSuplementarioFacade } from '../application/informe-suplementario.facade';
import { FiltrosTiempoSuplementarioDto } from '../application/dto/filtros-tiempo-suplementario.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

type InformeHeAuthRequest = {
  user?: { nit?: string | number; role?: string | number };
};

function sesionDesdeReq(req: InformeHeAuthRequest) {
  return {
    nit: Number(req.user?.nit) || 0,
    perfil: req.user?.role,
  };
}

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-tiempo-suplementario')
export class InformeSuplementarioController {
  constructor(private readonly facade: InformeSuplementarioFacade) {}

  @Get()
  listar(
    @Query() filtros: FiltrosTiempoSuplementarioDto,
    @Req() req: InformeHeAuthRequest,
  ) {
    return this.facade.listar(filtros, sesionDesdeReq(req));
  }

  @Get('exportar')
  async exportar(
    @Query() filtros: FiltrosTiempoSuplementarioDto,
    @Req() req: InformeHeAuthRequest,
  ): Promise<StreamableFile> {
    const buffer = await this.facade.exportarExcel(
      filtros,
      sesionDesdeReq(req),
    );
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="informe-tiempo-suplementario.xlsx"',
    });
  }
}
