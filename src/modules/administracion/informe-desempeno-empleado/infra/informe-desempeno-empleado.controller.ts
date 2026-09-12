import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { DesempenoEmpleadoFacade } from '../application/desempeno-empleado.facade';

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-desempeno-empleado')
export class InformeDesempenoEmpleadoController {
  constructor(private readonly facade: DesempenoEmpleadoFacade) {}

  @Get()
  listar(
    @Query('anio') anio: string,
    @Req() req: { user?: { nit?: string | number } },
    @Query('sede') sede?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const anioNum = Number(anio);
    return this.facade.listar({
      anio: anioNum,
      sede: sede || null,
      pagina: pagina ? Number(pagina) : 1,
      limite: limite ? Number(limite) : 10,
      nitUsuario: Number(req.user?.nit),
    });
  }

  @Get(':id')
  detalle(@Param('id') id: string) {
    return this.facade.obtenerDetalle(Number(id));
  }
}
