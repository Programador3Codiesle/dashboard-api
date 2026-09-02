import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { EncuestasFacade } from '../application/encuestas.facade';
import { NpsSedeDto, NpsTecnicoDto } from '../application/dto/encuestas.dto';
import { SatisfaccionDetalleQueryDto } from '../application/dto/satisfaccion-detalle-query.dto';
import { SatisfaccionListadoQueryDto } from '../application/dto/satisfaccion-listado-query.dto';
import { CodieselEmpresaGuard } from '../shared/utils/codiesel-empresa.guard';

const EXCEL_UPLOAD = FileInterceptor('fileContacts', {
  storage: memoryStorage(),
});

@Controller('encuestas')
@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
export class EncuestasController {
  constructor(private readonly facade: EncuestasFacade) {}

  @Get('satisfaccion')
  listarSatisfaccion(@Query() query: SatisfaccionListadoQueryDto) {
    return this.facade.listarSatisfaccion(query.q, query.page, query.pageSize);
  }

  @Get('satisfaccion/detalle')
  detalleSatisfaccion(@Query() query: SatisfaccionDetalleQueryDto) {
    return this.facade.detalleSatisfaccion(query.ot);
  }

  @Get('nps-colmotores/tecnicos')
  listarTecnicos() {
    return this.facade.listarTecnicosNps();
  }

  @Post('nps-colmotores/sede')
  insertNpsSede(@Body() dto: NpsSedeDto) {
    return this.facade.insertNpsSede(dto);
  }

  @Post('nps-colmotores/tecnico')
  insertNpsTecnico(@Body() dto: NpsTecnicoDto) {
    return this.facade.insertNpsTecnico({
      ...dto,
      tipificacion: dto.tipificacion ?? 'Ninguno',
    });
  }

  @Post('nps-tecnicos/upload')
  @UseInterceptors(EXCEL_UPLOAD)
  async uploadNpsTecnicos(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Archivo requerido');
    }
    return this.facade.uploadNpsTecnicos(file.buffer);
  }

  @Get('nps-tecnicos/plantilla')
  async descargarPlantilla(@Res() res: Response) {
    const buffer = await this.facade.generarPlantillaNps();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="formato_nps.xlsx"',
    );
    res.send(buffer);
  }
}
