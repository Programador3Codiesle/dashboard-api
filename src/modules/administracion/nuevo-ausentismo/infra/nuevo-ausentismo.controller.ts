import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NuevoAusentismoFacade } from '../application/nuevo-ausentismo.facade';
import { CreateAusentismoDto } from '../application/dto/create-ausentismo.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ADJUNTO_AUSENTISMO_MAX_BYTES } from '../../shared/adjunto-ausentismo';

type AuthReq = { user?: { nit?: string | number } };

@UseGuards(JwtAuthGuard)
@Controller('administracion/nuevo-ausentismo')
export class NuevoAusentismoController {
  constructor(private readonly facade: NuevoAusentismoFacade) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('archivo_soporte', {
      storage: memoryStorage(),
      limits: { fileSize: ADJUNTO_AUSENTISMO_MAX_BYTES },
    }),
  )
  crear(
    @Req() req: AuthReq,
    @Body() dto: CreateAusentismoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user?.nit ? Number(req.user.nit) : null;
    if (!userId) {
      throw new BadRequestException('No se pudo obtener el ID del usuario');
    }
    return this.facade.crearAusentismo(dto, userId, file);
  }

  @Get('calendario')
  obtenerCalendario(
    @Req() req: AuthReq,
    @Query('mes') mes: string,
    @Query('anio') anio: string,
  ) {
    const userId = req.user?.nit ? Number(req.user.nit) : null;
    if (!userId) {
      throw new BadRequestException('No se pudo obtener el ID del usuario');
    }
    return this.facade.obtenerCalendario(Number(mes), Number(anio), userId);
  }
}
