import {
  Controller,
  Get,
  Query,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';
import { InasistenciaFacade } from '../application/inasistencia.facade';
import { FiltrosInasistenciaDto } from '../application/dto/filtros-inasistencia.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/inasistencia')
export class InasistenciaController {
  constructor(private readonly facade: InasistenciaFacade) {}

  @Get()
  listar(@Query() filtros: FiltrosInasistenciaDto) {
    return this.facade.listar(filtros);
  }

  @Get('exportar')
  async exportar(
    @Query() filtros: FiltrosInasistenciaDto,
  ): Promise<StreamableFile> {
    const buffer = await this.facade.exportarExcel(filtros);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="inasistencias.xlsx"',
    });
  }
}
