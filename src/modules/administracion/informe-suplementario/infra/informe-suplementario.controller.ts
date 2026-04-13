import {
  Controller,
  Get,
  Query,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';
import { InformeSuplementarioFacade } from '../application/informe-suplementario.facade';
import { FiltrosTiempoSuplementarioDto } from '../application/dto/filtros-tiempo-suplementario.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-tiempo-suplementario')
export class InformeSuplementarioController {
  constructor(private readonly facade: InformeSuplementarioFacade) {}

  @Get()
  listar(@Query() filtros: FiltrosTiempoSuplementarioDto) {
    return this.facade.listar(filtros);
  }

  @Get('exportar')
  async exportar(
    @Query() filtros: FiltrosTiempoSuplementarioDto,
  ): Promise<StreamableFile> {
    const buffer = await this.facade.exportarExcel(filtros);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="informe-tiempo-suplementario.xlsx"',
    });
  }
}
