import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage, memoryStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import {
  MantenimientoFacade,
  parseHojaVidaBody,
} from '../application/mantenimiento.facade';
import {
  assertCodieselEmpresa,
  parseSession,
  type AuthRequest,
} from './mantenimiento-auth.util';

function diskUpload(subdir: string) {
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const uploadDir = join(
          process.cwd(),
          'public',
          'mantenimiento',
          subdir,
        );
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
  });
}

@Controller('mantenimiento')
@UseGuards(JwtAuthGuard)
export class MantenimientoController {
  constructor(private readonly facade: MantenimientoFacade) {}

  @Get('catalogos')
  catalogos(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.catalogos();
  }

  @Get('equipos')
  listarEquipos(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: string,
    @Query('bodega') bodega?: string,
    @Query('area') area?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.listarEquipos(
      Number(page) || 1,
      Number(limit) || 10,
      filter,
      bodega,
      area,
    );
  }

  @Get('equipos/:id')
  getEquipo(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    assertCodieselEmpresa(req);
    return this.facade.getEquipo(id);
  }

  @Post('equipos/nombres-familia')
  nombresFamilia(@Req() req: AuthRequest, @Body('codigo') codigo: string) {
    assertCodieselEmpresa(req);
    return this.facade.nombresFamilia(codigo);
  }

  @Post('equipos')
  @UseInterceptors(diskUpload('cv_equipos'))
  crearEquipo(
    @Req() req: AuthRequest,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.crearEquipo(
      {
        aliasEquipo: body.aliasEquipo,
        nombreEquipo: body.nombreEquipo,
        nombreEquipo2: body.nombreEquipo2,
        nombreBodega: body.nombreBodega,
        nombrearea: body.nombrearea,
        codigoE: body.codigoE,
      },
      parseHojaVidaBody(body),
      file?.filename,
    );
  }

  @Put('equipos/:id')
  @UseInterceptors(diskUpload('cv_equipos'))
  actualizarEquipo(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.actualizarEquipo(
      id,
      {
        nombre_equipo: body.nombre_equipo,
        bodega: body.bodega,
        codigo: body.codigo,
        estado: body.estado,
        area: body.area,
        alias_equipo: body.alias_equipo,
      },
      file?.filename,
    );
  }

  @Get('equipos/:id/hoja-vida')
  getHojaVida(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.getHojaVida(id);
  }

  @Put('equipos/:id/hoja-vida')
  @UseInterceptors(diskUpload('cv_equipos'))
  updateHojaVida(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.updateHojaVida(
      id,
      {
        nombre_equipo: body.nombre_equipo,
        bodega: body.bodega,
        codigo: body.codigo,
        estado: body.estado,
        area: body.area,
        alias_equipo: body.alias_equipo || body.aliasEquipo,
      },
      parseHojaVidaBody(body),
      file?.filename,
    );
  }

  @Post('equipos/:id/orden-preventivo')
  ordenPreventivo(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) _id: number,
    @Body() body: Record<string, string>,
  ) {
    assertCodieselEmpresa(req);
    const user = parseSession(req);
    return this.facade.ordenPreventivoDesdeEquipo(user, {
      codigoEquipoMp: body.codigoEquipoMp,
      f_requerida: body.f_requerida,
      tiempo_estimado: Number(body.tiempo_estimado),
      descripcionMp: body.descripcionMp,
    });
  }

  @Get('equipos/:id/historial')
  async historial(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    assertCodieselEmpresa(req);
    const eq = await this.facade.getEquipo(id);
    if (!eq) return { preventivo: [], correctivo: [] };
    return this.facade.historial(eq.codigo, id);
  }

  @Post('equipos/:id/retiro')
  @UseInterceptors(diskUpload(''))
  retiro(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    const user = parseSession(req);
    if (!file) throw new BadRequestException('Imagen requerida');
    return this.facade.solicitarRetiro(
      user,
      id,
      body.jefe,
      body.motivo_solicitud,
      file.filename,
    );
  }

  @Get('correctivo/solicitudes')
  listarCorrectivo(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.listarCorrectivo(parseSession(req));
  }

  @Get('correctivo/solicitudes/:id')
  getSolicitud(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.getSolicitud(id);
  }

  @Post('correctivo/solicitudes')
  @UseInterceptors(diskUpload('solicitudes'))
  crearSolicitud(
    @Req() req: AuthRequest,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.crearSolicitud(
      parseSession(req),
      {
        equipoId: body.equipoId,
        sedeBodega: body.sedeBodega,
        urgencia: body.urgencia,
        solicitud: body.solicitud,
      },
      file?.filename ?? null,
    );
  }

  @Post('correctivo/solicitudes/:id/iniciar')
  iniciarSolicitud(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('tiempo_estimado') tiempo?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.iniciarSolicitud(
      parseSession(req),
      id,
      Number(tiempo) || 1,
    );
  }

  @Post('correctivo/solicitudes/:id/finalizar')
  @UseInterceptors(diskUpload('solicitudes'))
  finalizarSolicitud(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('respuesta') respuesta: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.finalizarSolicitud(
      parseSession(req),
      id,
      respuesta,
      file?.filename ?? null,
    );
  }

  @Get('correctivo/solicitudes/:id/mensajes')
  mensajes(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    assertCodieselEmpresa(req);
    return this.facade.listarMensajes(id);
  }

  @Post('correctivo/solicitudes/:id/mensajes')
  agregarMensaje(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('mensaje') mensaje: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.agregarMensaje(parseSession(req), id, mensaje);
  }

  @Patch('correctivo/solicitudes/:id/equipo')
  updateEquipoSolicitud(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('id_equipo') idEquipo: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.updateEquipoSolicitud(id, Number(idEquipo));
  }

  @Get('preventivo/eventos')
  eventos(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.eventosPreventivo(parseSession(req));
  }

  @Get('preventivo/listado')
  listado(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.listadoPreventivo(parseSession(req));
  }

  @Get('preventivo/ordenes/:id')
  orden(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    assertCodieselEmpresa(req);
    return this.facade.getOrdenPreventivo(id);
  }

  @Post('preventivo/ordenes/:id/iniciar')
  iniciarOrden(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('asignado') asignado: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.iniciarOrden(parseSession(req), id, asignado);
  }

  @Post('preventivo/ordenes/:id/finalizar')
  finalizarOrden(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      observaciones: string;
      piezas: string;
      reasignar?: boolean;
      periodo?: string;
    },
  ) {
    assertCodieselEmpresa(req);
    return this.facade.finalizarOrden(
      parseSession(req),
      id,
      body.observaciones,
      body.piezas,
      Boolean(body.reasignar),
      body.periodo,
    );
  }

  @Delete('preventivo/ordenes/:id')
  eliminarOrden(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.eliminarOrden(id);
  }

  @Patch('preventivo/ordenes/:id/fecha')
  updateFecha(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { date: string; date_old: string },
  ) {
    assertCodieselEmpresa(req);
    return this.facade.updateFecha(
      parseSession(req),
      id,
      body.date,
      body.date_old,
    );
  }

  @Post('preventivo/upload')
  @UseInterceptors(
    FileInterceptor('excel', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  upload(
    @Req() req: AuthRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    if (!file?.buffer) throw new BadRequestException('Archivo requerido');
    return this.facade.uploadCronograma(parseSession(req), file.buffer);
  }

  @Get('preventivo/plantilla')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  plantilla(@Req() req: AuthRequest, @Res() res: Response) {
    assertCodieselEmpresa(req);
    const path = join(
      process.cwd(),
      'public',
      'mantenimiento',
      'PlantillaPlanDeMantenimientoPreventivo.xlsx',
    );
    if (!fs.existsSync(path)) {
      res.status(404).send('Plantilla no encontrada');
      return;
    }
    res.download(path, 'PlantillaPlanDeMantenimientoPreventivo.xlsx');
  }

  @Get('informes/preventivo')
  informePreventivo(
    @Req() req: AuthRequest,
    @Query('estado') estado?: string,
    @Query('bodega') bodega?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.informePreventivo(estado, bodega);
  }

  @Get('informes/correctivo')
  informeCorrectivo(
    @Req() req: AuthRequest,
    @Query('estado') estado?: string,
    @Query('bodega') bodega?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.informeCorrectivo(estado, bodega);
  }
}
