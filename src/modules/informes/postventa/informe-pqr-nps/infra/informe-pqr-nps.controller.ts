import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PqrNpsFacade } from '../application/pqr-nps.facade';
import {
  PqrNpsGestionEntity,
  PqrNpsItemEntity,
  PqrNpsTecnicoEntity,
  PqrNpsVehiculoInfoEntity,
  PqrNpsVerbalizacionEntity,
} from '../domain/pqr-nps.entity';
import { FiltrosPqrNps } from '../domain/pqr-nps.repository';
import { ActualizarPqrNpsDto } from '../application/dto/actualizar-pqr-nps.dto';
import { CrearPqrDto } from '../application/dto/crear-pqr.dto';
import { CrearVerbalizacionDto } from '../application/dto/crear-verbalizacion.dto';

@Controller('informes/postventa/pqr-nps')
export class InformePqrNpsController {
  constructor(private readonly facade: PqrNpsFacade) {}

  @Get()
  listar(
    @Query('estado') estado?: 'abiertos' | 'cerrados' | 'todos',
  ): Promise<PqrNpsItemEntity[]> {
    const filtros: FiltrosPqrNps = {
      estado: estado ?? 'abiertos',
    };

    return this.facade.listar(filtros);
  }

  @Get('gestion')
  obtenerGestion(
    @Query('fuente') fuente: string,
    @Query('idFuente', ParseIntPipe) idFuente: number,
  ): Promise<PqrNpsGestionEntity | null> {
    return this.facade.obtenerGestion(fuente, idFuente);
  }

  @Put('gestion')
  guardarGestion(@Body() body: ActualizarPqrNpsDto): Promise<void> {
    return this.facade.guardarGestion(body);
  }

  @Post('crear-pqr')
  crearPqr(@Body() body: CrearPqrDto): Promise<void> {
    return this.facade.crearPqr(body);
  }

  @Get('auxiliares/cliente')
  obtenerClientePorNit(@Query('nit') nit: string): Promise<string | null> {
    return this.facade.obtenerClientePorNit(nit);
  }

  @Get('auxiliares/vehiculo')
  obtenerVehiculo(
    @Query('placa') placa: string,
  ): Promise<PqrNpsVehiculoInfoEntity | null> {
    return this.facade.obtenerInfoVehiculo(placa);
  }

  @Get('auxiliares/tecnicos')
  listarTecnicos(): Promise<PqrNpsTecnicoEntity[]> {
    return this.facade.listarTecnicos();
  }

  @Post('verbalizaciones')
  crearVerbalizacion(@Body() body: CrearVerbalizacionDto): Promise<void> {
    return this.facade.crearVerbalizacion(body);
  }

  @Get('verbalizaciones/:idPqrNps')
  listarVerbalizaciones(
    @Param('idPqrNps', ParseIntPipe) idPqrNps: number,
  ): Promise<PqrNpsVerbalizacionEntity[]> {
    return this.facade.listarVerbalizaciones(idPqrNps);
  }
}
