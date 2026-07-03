import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { readFileSync } from 'fs';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { MpviAdminFacade } from '../application/mpvi-admin.facade';
import {
  GuardarElementoCatalogoDto,
  SubirTablasAuxiliaresDto,
} from '../application/dto/mpvi-admin.dto';
import type { CatalogoTipo } from '../application/use-cases/listar-catalogo-mpvi.usecase';

const EXCEL_UPLOAD = FileInterceptor('archivo', { storage: memoryStorage() });

function fileBuffer(file: Express.Multer.File): Buffer {
  if (!file) throw new BadRequestException('Archivo requerido');
  if (file.buffer) return file.buffer;
  if (file.path) return readFileSync(file.path);
  throw new BadRequestException('Archivo requerido');
}

const CATALOGO_TIPOS: CatalogoTipo[] = [
  'sistemas',
  'subsistemas',
  'familias-vh',
  'vehiculos',
  'repuestos',
];

@UseGuards(JwtAuthGuard)
@Controller('taller/mpvi/admin')
export class MpviAdminController {
  constructor(private readonly facade: MpviAdminFacade) {}

  @Post('plantilla')
  @UseInterceptors(EXCEL_UPLOAD)
  async subirPlantilla(@UploadedFile() file: Express.Multer.File) {
    const filas = await this.facade.subirPlantilla(fileBuffer(file));
    return { filasProcesadas: filas };
  }

  @Post('tablas-auxiliares')
  @UseInterceptors(EXCEL_UPLOAD)
  async subirTablasAuxiliares(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirTablasAuxiliaresDto,
  ) {
    const tabla = Number((dto as { tabla?: number | string }).tabla ?? 0);
    const result = await this.facade.subirTablasAuxiliares(
      fileBuffer(file),
      tabla,
    );
    return result;
  }

  @Get('catalogo/:tipo')
  listarCatalogo(@Param('tipo') tipo: string) {
    if (!CATALOGO_TIPOS.includes(tipo as CatalogoTipo)) {
      throw new BadRequestException('Tipo de catálogo inválido');
    }
    return this.facade.listarCatalogo(tipo as CatalogoTipo);
  }

  @Post('catalogo/elemento')
  guardarElemento(@Body() dto: GuardarElementoCatalogoDto) {
    return this.facade.guardarElemento(dto);
  }
}
