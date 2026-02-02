import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFiles, StreamableFile } from '@nestjs/common';
import { GestionCompraFacade } from '../application/gestion-compra.facade';
import { CreateGestionCompraDto } from '../application/dto/create-gestion-compra.dto';
import { FiltrosComprasDto } from '../application/dto/filtros-compras.dto';
import { CambiarEstadoCompraDto } from '../application/dto/cambiar-estado-compra.dto';
import { CrearMensajeCompraDto } from '../application/dto/crear-mensaje-compra.dto';
import { EnviarAutorizacionCompraDto } from '../application/dto/enviar-autorizacion-compra.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@UseGuards(JwtAuthGuard)
@Controller('administracion/gestion-compras')
export class GestionComprasController {
    constructor(private readonly facade: GestionCompraFacade) {}

    @Post()
    crearSolicitud(@Req() req: any, @Body() dto: CreateGestionCompraDto) {
        // usu_solicita en BD es el NIT (cédula) del solicitante, viene del JWT
        const usuSolicitaNit = req.user?.nit != null ? Number(req.user.nit) : null;
        if (usuSolicitaNit == null) {
            throw new Error('No se pudo obtener el NIT del usuario');
        }
        // id_empresa: del body (como formato-orden-salida) o cookie 'user' como fallback
        let idEmpresa: number | undefined = dto.id_empresa != null ? Number(dto.id_empresa) : undefined;
        if (idEmpresa == null && req.cookies && req.cookies['user']) {
            try {
                const userCookie = JSON.parse(req.cookies['user']);
                if (userCookie && userCookie.empresa != null) {
                    idEmpresa = Number(userCookie.empresa);
                }
            } catch (e) {
                console.error('Error parsing user cookie:', e);
            }
        }
        return this.facade.crearSolicitud(dto, usuSolicitaNit, idEmpresa);
    }

    @Get()
    listar(@Query() filtros: FiltrosComprasDto) {
        return this.facade.listarCompras(filtros);
    }

    @Get('exportar')
    async exportar(@Query() filtros: FiltrosComprasDto): Promise<StreamableFile> {
        const buffer = await this.facade.exportarExcel(filtros);
        return new StreamableFile(buffer, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: 'attachment; filename="gestion-compras.xlsx"',
        });
    }

    @Patch(':id/estado')
    cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoCompraDto) {
        return this.facade.cambiarEstado(BigInt(id), dto);
    }

    @Patch(':id/con-factura')
    marcarConFactura(@Param('id', ParseIntPipe) id: number, @Body('conFactura') conFactura: string) {
        return this.facade.marcarConFactura(BigInt(id), conFactura);
    }

    @Get(':id/mensajes')
    listarMensajes(@Param('id', ParseIntPipe) id: number) {
        return this.facade.listarMensajes(BigInt(id));
    }

    @Post(':id/mensajes')
    crearMensaje(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: CrearMensajeCompraDto) {
        const nitUsuario = req.user?.nit ? Number(req.user.nit) : null;
        if (!nitUsuario) {
            throw new Error('No se pudo obtener el NIT del usuario');
        }
        return this.facade.crearMensaje(BigInt(id), nitUsuario, dto);
    }

    @Post(':id/autorizacion')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: (_req, _file, cb) => {
                    const uploadDir = join(process.cwd(), 'public', 'uploads', 'administracion', 'gestion-compra');
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
                    return cb(new Error('Tipo de archivo no permitido. Solo PDF/JPG/PNG'), false);
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
        const archivos = (files || []).map((f) => `/uploads/administracion/gestion-compra/${f.filename}`);
        const dto: EnviarAutorizacionCompraDto = { comentarios, archivos };
        return this.facade.enviarAutorizacion(BigInt(id), dto);
    }

    }
