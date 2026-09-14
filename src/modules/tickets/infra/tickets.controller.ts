import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
  Redirect,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TicketFacade } from '../application/ticket.facade';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { readEmpresaIdFromCookie } from '../../../core/config/empresa-sesion';
import {
  CreateTicketDto,
  ReasignarTicketDto,
} from '../application/dto/create-ticket.dto';
import { reponderTicketDto } from '../application/dto/update-ticket.dto';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

type TicketAuthRequest = {
  user?: { nit?: string | number; role?: string | number };
  cookies?: Record<string, string>;
};

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly facade: TicketFacade) {}

  /**
   * Subida de adjuntos del ticket (multipart). Misma forma que el route de Next
   * eliminado: guarda en public/uploads/tickets y devuelve { status, url }.
   * Va detrás del mismo proxy /api que el resto de tickets.
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets');
          try {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
          } catch (e) {
            cb(e as Error, uploadDir);
          }
        },
        filename: (_req, file, cb) => {
          const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          cb(null, `${Date.now()}_${safeName}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
        ];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new Error(
              'Tipo de archivo no permitido. Solo se permiten PNG, JPG y PDF',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return {
      status: true,
      message: 'Archivo subido correctamente',
      url: `/uploads/tickets/${file.filename}`,
    };
  }

  @Post()
  create(@Body() dto: CreateTicketDto, @Req() req: TicketAuthRequest) {
    const nitSesion = Number(req.user?.nit);
    return this.facade.create({
      ...dto,
      usuario_id: Number.isFinite(nitSesion) ? nitSesion : dto.usuario_id,
    });
  }

  @Get('activos')
  getActivos(
    @Req() req: TicketAuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 50;
    return this.facade.getActivos(p, l, Number(req.user?.role));
  }

  @Get('finalizados')
  getFinalizados(
    @Req() req: TicketAuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 50;
    return this.facade.getFinalizados(
      p,
      l,
      Number(req.user?.role),
      Number(req.user?.nit),
    );
  }

  @Get('mis-tickets/:userId')
  getByUsuario(@Param('userId') userId: string) {
    return this.facade.getByUsuario(+userId);
  }

  /**
   * Si el archivo está en Nest (`public/uploads/tickets`) redirige a APP_URL.
   * Si no, redirige al PHP (`TICKETS_LEGACY_BASE_URL/public/tickets`).
   */
  @Get('adjunto')
  @Redirect()
  adjunto(@Query('file') file?: string) {
    return {
      url: this.facade.resolverAdjunto(file),
      statusCode: 302,
    };
  }

  @Get(':id')
  getTicket(@Param('id') id: string) {
    return this.facade.getTicket(+id);
  }

  @Put(':id/reasignar')
  reasignar(@Param('id') id: string, @Body() dto: ReasignarTicketDto) {
    return this.facade.reasignar(+id, dto);
  }

  @Put(':id/responder')
  addRespuesta(
    @Param('id') id: string,
    @Body() dto: reponderTicketDto,
    @Req() req: TicketAuthRequest,
  ) {
    return this.facade.addRespuesta(
      +id,
      dto,
      Number(req.user?.nit),
      readEmpresaIdFromCookie(req.cookies),
    );
  }
}
