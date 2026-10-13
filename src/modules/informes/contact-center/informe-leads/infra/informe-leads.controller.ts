import {
  Controller,
  Get,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { InformeLeadsFacade } from '../application/informe-leads.facade';

@UseGuards(JwtAuthGuard)
@Controller('informes/contact-center/informe-leads')
export class InformeLeadsController {
  constructor(private readonly facade: InformeLeadsFacade) {}

  @Get('excel')
  async excel(
    @Query('desde') desde = '',
    @Query('hasta') hasta = '',
  ): Promise<StreamableFile> {
    const buffer = await this.facade.exportarExcel(desde, hasta);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="informe-leads.xlsx"',
    });
  }

  @Get()
  listar(
    @Query('desde') desde = '',
    @Query('hasta') hasta = '',
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    return this.facade.listar(desde, hasta, Number(pagina), Number(limite));
  }
}
