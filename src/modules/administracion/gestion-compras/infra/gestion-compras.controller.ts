import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { GestionCompraFacade } from '../application/gestion-compra.facade';
import { CreateGestionCompraDto } from '../application/dto/create-gestion-compra.dto';
import { FiltrosComprasDto } from '../application/dto/filtros-compras.dto';
import { CambiarEstadoCompraDto } from '../application/dto/cambiar-estado-compra.dto';
import { CrearMensajeCompraDto } from '../application/dto/crear-mensaje-compra.dto';
import { EnviarAutorizacionCompraDto } from '../application/dto/enviar-autorizacion-compra.dto';
import { SesionListarCompras } from '../application/visibilidad-compras';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { empresaIdDesdeCookie } from '../../../../core/config/empresa-sesion';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

type GestionComprasAuthRequest = {
  user?: { nit?: string | number; role?: string | number };
  cookies?: Record<string, string>;
};

function sesionListarDesdeReq(
  req: GestionComprasAuthRequest,
): SesionListarCompras {
  const nit = req.user?.nit != null ? Number(req.user.nit) : NaN;
  if (!Number.isFinite(nit)) {
    throw new BadRequestException('No se pudo obtener el NIT del usuario');
  }
  const perfil = req.user?.role != null ? Number(req.user.role) : 0;
  return {
    nit,
    perfil: Number.isFinite(perfil) ? perfil : 0,
    empresaId: empresaIdDesdeCookie(req.cookies),
  };
}

@UseGuards(JwtAuthGuard)
@Controller('administracion/gestion-compras')
export class GestionComprasController {
  constructor(private readonly facade: GestionCompraFacade) {}

  @Post()
  crearSolicitud(
    @Req() req: GestionComprasAuthRequest,
    @Body() dto: CreateGestionCompraDto,
  ) {
    const usuSolicitaNit = req.user?.nit != null ? Number(req.user.nit) : NaN;
    if (!Number.isFinite(usuSolicitaNit)) {
      throw new BadRequestException('No se pudo obtener el NIT del usuario');
    }
    let idEmpresa: number | undefined =
      dto.id_empresa != null ? Number(dto.id_empresa) : undefined;
    if (idEmpresa == null) {
      idEmpresa = empresaIdDesdeCookie(req.cookies);
    }
    return this.facade.crearSolicitud(dto, usuSolicitaNit, idEmpresa);
  }

  @Get()
  listar(
    @Req() req: GestionComprasAuthRequest,
    @Query() filtros: FiltrosComprasDto,
  ) {
    return this.facade.listarCompras(filtros, sesionListarDesdeReq(req));
  }

  @Get('exportar')
  async exportar(
    @Req() req: GestionComprasAuthRequest,
    @Query() filtros: FiltrosComprasDto,
  ): Promise<StreamableFile> {
    const buffer = await this.facade.exportarExcel(
      filtros,
      sesionListarDesdeReq(req),
    );
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="gestion-compras.xlsx"',
    });
  }

  @Get('usuarios-gerente')
  listarUsuariosGerente() {
    return this.facade.listarUsuariosGerente();
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoCompraDto,
  ) {
    return this.facade.cambiarEstado(BigInt(id), dto);
  }

  @Patch(':id/con-factura')
  marcarConFactura(
    @Param('id', ParseIntPipe) id: number,
    @Body('conFactura') conFactura: string,
  ) {
    return this.facade.marcarConFactura(BigInt(id), conFactura);
  }

  @Get(':id/mensajes')
  listarMensajes(@Param('id', ParseIntPipe) id: number) {
    return this.facade.listarMensajes(BigInt(id));
  }

  @Post(':id/mensajes')
  crearMensaje(
    @Req() req: GestionComprasAuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearMensajeCompraDto,
  ) {
    const nitUsuario = req.user?.nit != null ? Number(req.user.nit) : NaN;
    if (!Number.isFinite(nitUsuario)) {
      throw new BadRequestException('No se pudo obtener el NIT del usuario');
    }
    return this.facade.crearMensaje(BigInt(id), nitUsuario, dto);
  }

  @Post(':id/autorizacion')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(
            process.cwd(),
            'public',
            'uploads',
            'administracion',
            'gestion-compra',
          );
          try {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
          } catch (e) {
            cb(e as Error, uploadDir);
          }
        },
        filename: (_req, file, cb) => {
          const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          const name = `${Date.now()}_${Math.round(Math.random() * 1e9)}_${safeBase}`;
          cb(null, name);
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
            new Error('Tipo de archivo no permitido. Solo PDF/JPG/PNG'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por archivo
    }),
  )
  enviarAutorizacion(
    @Param('id', ParseIntPipe) id: number,
    @Body('comentarios') comentarios: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const archivos = (files || []).map(
      (f) => `/uploads/administracion/gestion-compra/${f.filename}`,
    );
    const dto: EnviarAutorizacionCompraDto = { comentarios, archivos };
    return this.facade.enviarAutorizacion(BigInt(id), dto);
  }
}
