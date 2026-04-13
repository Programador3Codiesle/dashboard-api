import {
  BadRequestException,
  Controller,
  Get,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { PacNpsInternoDetalladoFacade } from '../application/pac-nps-interno-detallado.facade';
import { FiltrosPacNpsInterno } from '../domain/pac-nps-interno-detallado.repository';

function parseFechaYm(fecha: string | undefined): {
  filtros: FiltrosPacNpsInterno;
  fechaParam: string;
} {
  if (!fecha || !/^\d{4}-\d{2}$/.test(fecha)) {
    throw new BadRequestException(
      'El parámetro fecha debe tener el formato YYYY-MM.',
    );
  }
  const [anioStr, mesStr] = fecha.split('-');
  const anio = Number(anioStr);
  const mes = Number(mesStr);
  if (!Number.isFinite(anio) || !Number.isFinite(mes) || mes < 1 || mes > 12) {
    throw new BadRequestException('Fecha inválida.');
  }
  return { filtros: { anio, mes }, fechaParam: fecha };
}

function parseBodegaOpcional(
  bodega: string | undefined,
): number | undefined {
  if (bodega === undefined || bodega === null || bodega === '') {
    return undefined;
  }
  const n = Number(bodega);
  if (!Number.isFinite(n) || n <= 0) {
    throw new BadRequestException('Parámetro bodega inválido.');
  }
  return n;
}

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/pac-nps-interno-detallado')
export class InformePacNpsInternoDetalladoController {
  constructor(private readonly facade: PacNpsInternoDetalladoFacade) {}

  @Get()
  listar(@Query('fecha') fecha: string) {
    const { filtros } = parseFechaYm(fecha);
    return this.facade.listar(filtros);
  }

  @Get('tecnicos')
  listarTecnicos(
    @Query('fecha') fecha: string,
    @Query('bodega') bodegaStr: string,
  ) {
    const { filtros } = parseFechaYm(fecha);
    const bodega = Number(bodegaStr);
    if (!Number.isFinite(bodega) || bodega <= 0) {
      throw new BadRequestException('Parámetro bodega obligatorio e inválido.');
    }
    return this.facade.listarTecnicosPorBodega(bodega, filtros);
  }

  @Get('encuestas-tecnico')
  listarEncuestasTecnico(
    @Query('fecha') fecha: string,
    @Query('nombre') nombre: string,
  ) {
    const { filtros } = parseFechaYm(fecha);
    if (!nombre?.trim()) {
      throw new BadRequestException('Parámetro nombre obligatorio.');
    }
    return this.facade.listarEncuestasPorTecnico(nombre.trim(), filtros);
  }

  @Get('exportar/detalle-tecnico')
  async exportarDetalleTecnico(
    @Query('fecha') fecha: string,
    @Query('nombre') nombre: string,
  ): Promise<StreamableFile> {
    const { filtros, fechaParam } = parseFechaYm(fecha);
    if (!nombre?.trim()) {
      throw new BadRequestException('Parámetro nombre obligatorio.');
    }
    const { buffer, filename } = await this.facade.exportarDetalleTecnicoExcel(
      nombre.trim(),
      filtros,
      fechaParam,
    );
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${filename.replace(/"/g, '')}"`,
    });
  }

  @Get('exportar/todos')
  async exportarTodos(
    @Query('fecha') fecha: string,
    @Query('bodega') bodegaStr?: string,
  ): Promise<StreamableFile> {
    const { filtros, fechaParam } = parseFechaYm(fecha);
    const bodega = parseBodegaOpcional(bodegaStr);
    const { buffer, filename } = await this.facade.exportarTodosTecnicosExcel(
      filtros,
      fechaParam,
      bodega,
    );
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${filename.replace(/"/g, '')}"`,
    });
  }
}
