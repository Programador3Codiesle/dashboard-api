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
  FinalizarOrdenDto,
  InformeQueryDto,
  IniciarOrdenDto,
  IniciarSolicitudDto,
  ListarEquiposQueryDto,
  MensajeDto,
  NombresFamiliaDto,
  OrdenPreventivoDto,
  UpdateEquipoSolicitudDto,
  UpdateFechaOrdenDto,
} from '../application/dto/mantenimiento-query.dto';
import { parseSession, type AuthRequest } from './mantenimiento-auth.util';
import { CodieselEmpresaGuard } from '../shared/utils/codiesel-empresa.guard';

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
@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
export class MantenimientoController {
  constructor(private readonly facade: MantenimientoFacade) {}

  @Get('catalogos')
  catalogos() {
    return this.facade.catalogos();
  }

  @Get('equipos')
  listarEquipos(@Query() query: ListarEquiposQueryDto) {
    return this.facade.listarEquipos(
      query.page ?? 1,
      query.limit ?? 10,
      query.filter,
      query.bodega,
      query.area,
    );
  }

  @Get('equipos/:id')
  getEquipo(@Param('id', ParseIntPipe) id: number) {
    return this.facade.getEquipo(id);
  }

  @Post('equipos/nombres-familia')
  nombresFamilia(@Body() body: NombresFamiliaDto) {
    return this.facade.nombresFamilia(body.codigo);
  }

  @Post('equipos')
  @UseInterceptors(diskUpload('cv_equipos'))
  crearEquipo(
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
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
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
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
  getHojaVida(@Param('id', ParseIntPipe) id: number) {
    return this.facade.getHojaVida(id);
  }

  @Put('equipos/:id/hoja-vida')
  @UseInterceptors(diskUpload('cv_equipos'))
  updateHojaVida(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
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
    @Body() body: OrdenPreventivoDto,
  ) {
    return this.facade.ordenPreventivoDesdeEquipo(parseSession(req), body);
  }

  @Get('equipos/:id/historial')
  historial(@Param('id', ParseIntPipe) id: number) {
    return this.facade.historial(id);
  }

  @Post('equipos/:id/retiro')
  @UseInterceptors(diskUpload(''))
  retiro(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Imagen requerida');
    return this.facade.solicitarRetiro(
      parseSession(req),
      id,
      body.jefe,
      body.motivo_solicitud,
      file.filename,
    );
  }

  @Get('correctivo/solicitudes')
  listarCorrectivo(@Req() req: AuthRequest) {
    return this.facade.listarCorrectivo(parseSession(req));
  }

  @Get('correctivo/solicitudes/:id')
  getSolicitud(@Param('id', ParseIntPipe) id: number) {
    return this.facade.getSolicitud(id);
  }

  @Post('correctivo/solicitudes')
  @UseInterceptors(diskUpload('solicitudes'))
  crearSolicitud(
    @Req() req: AuthRequest,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
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
    @Body() body: IniciarSolicitudDto,
  ) {
    return this.facade.iniciarSolicitud(
      parseSession(req),
      id,
      body.tiempo_estimado || 1,
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
    return this.facade.finalizarSolicitud(
      parseSession(req),
      id,
      respuesta,
      file?.filename ?? null,
    );
  }

  @Get('correctivo/solicitudes/:id/mensajes')
  mensajes(@Param('id', ParseIntPipe) id: number) {
    return this.facade.listarMensajes(id);
  }

  @Post('correctivo/solicitudes/:id/mensajes')
  agregarMensaje(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MensajeDto,
  ) {
    return this.facade.agregarMensaje(parseSession(req), id, body.mensaje);
  }

  @Patch('correctivo/solicitudes/:id/equipo')
  updateEquipoSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEquipoSolicitudDto,
  ) {
    return this.facade.updateEquipoSolicitud(id, body.id_equipo);
  }

  @Get('preventivo/eventos')
  eventos(@Req() req: AuthRequest) {
    return this.facade.eventosPreventivo(parseSession(req));
  }

  @Get('preventivo/listado')
  listado(@Req() req: AuthRequest) {
    return this.facade.listadoPreventivo(parseSession(req));
  }

  @Get('preventivo/ordenes/:id')
  orden(@Param('id', ParseIntPipe) id: number) {
    return this.facade.getOrdenPreventivo(id);
  }

  @Post('preventivo/ordenes/:id/iniciar')
  iniciarOrden(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: IniciarOrdenDto,
  ) {
    return this.facade.iniciarOrden(parseSession(req), id, body.asignado);
  }

  @Post('preventivo/ordenes/:id/finalizar')
  finalizarOrden(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: FinalizarOrdenDto,
  ) {
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
  eliminarOrden(@Param('id', ParseIntPipe) id: number) {
    return this.facade.eliminarOrden(id);
  }

  @Patch('preventivo/ordenes/:id/fecha')
  updateFecha(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFechaOrdenDto,
  ) {
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
  upload(@Req() req: AuthRequest, @UploadedFile() file?: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException('Archivo requerido');
    return this.facade.uploadCronograma(parseSession(req), file.buffer);
  }

  @Get('preventivo/plantilla')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  plantilla(@Res() res: Response) {
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
  informePreventivo(@Query() query: InformeQueryDto) {
    return this.facade.informePreventivo(query.estado, query.bodega);
  }

  @Get('informes/correctivo')
  informeCorrectivo(@Query() query: InformeQueryDto) {
    return this.facade.informeCorrectivo(query.estado, query.bodega);
  }
}
