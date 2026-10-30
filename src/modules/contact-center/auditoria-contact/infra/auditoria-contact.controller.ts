import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { AuditoriaAdminGuard } from './auditoria-admin.guard';
import { getContactCenterSessionUser } from '../../shared/utils/contact-center-user.util';
import { AuditoriaContactFacade } from '../application/auditoria-contact.facade';
import {
  AddItemDto,
  AddObsDto,
  CompromisoAgenteDto,
  CrearAuditoriaDto,
  EstadoIndicadorDto,
  EstadoItemDto,
  EstadoObsDto,
  FinalizarAuditoriaDto,
  FormAuditoriaDto,
  IdAuditoriaDto,
  IdIndicadorDto,
  IdItemDto,
  InfDetalleDto,
  IndicadoresPuntosDto,
  ListarAuditoriasDto,
  UpdateIndDto,
  UpdateIndEstadoDto,
  UpdateRespuestaDto,
} from '../application/dto/auditoria-contact.dto';

type CcRequest = {
  cookies?: Record<string, string>;
  user?: { sub?: number; role?: number; nit?: number };
};

const UPLOAD_DIR = join(
  process.cwd(),
  'public',
  'uploads',
  'auditoria-contact',
);

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('contact-center/auditoria-contact')
export class AuditoriaContactController {
  constructor(private readonly facade: AuditoriaContactFacade) {}

  private session(req: CcRequest) {
    return getContactCenterSessionUser(req);
  }

  @Get('agentes')
  @UseGuards(AuditoriaAdminGuard)
  agentes(@Req() req: CcRequest) {
    const { perfil, nit } = this.session(req);
    return this.facade.getAgentes(perfil, nit);
  }

  @Get('cant-preguntas')
  @UseGuards(AuditoriaAdminGuard)
  cantPreguntas(@Req() req: CcRequest) {
    const { perfil, nit } = this.session(req);
    return this.facade.getCantPreguntas(perfil, nit);
  }

  @Get('contexto')
  contexto(@Req() req: CcRequest) {
    const { perfil, nit } = this.session(req);
    return this.facade.getContextoListado(perfil, nit);
  }

  @Post('crear')
  @UseGuards(AuditoriaAdminGuard)
  crear(@Req() req: CcRequest, @Body() dto: CrearAuditoriaDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.crearAuditoria(dto, perfil, nit);
  }

  @Post('formulario-vista-previa')
  @UseGuards(AuditoriaAdminGuard)
  formularioVistaPrevia(@Body() dto: FormAuditoriaDto) {
    return this.facade.cargarFormulario(dto, true);
  }

  @Post('formulario')
  @UseGuards(AuditoriaAdminGuard)
  formulario(@Body() dto: FormAuditoriaDto) {
    return this.facade.cargarFormulario(dto, true);
  }

  @Post('update-respuesta')
  @UseGuards(AuditoriaAdminGuard)
  updateRespuesta(@Req() req: CcRequest, @Body() dto: UpdateRespuestaDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.updateRespuesta(dto, perfil, nit);
  }

  @Post('finalizar')
  @UseGuards(AuditoriaAdminGuard)
  finalizar(@Req() req: CcRequest, @Body() dto: FinalizarAuditoriaDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.finalizarAuditoria(dto, perfil, nit);
  }

  @Post('listar-admin')
  @UseGuards(AuditoriaAdminGuard)
  listarAdmin(@Req() req: CcRequest, @Body() dto: ListarAuditoriasDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.listarAdmin(dto, perfil, nit);
  }

  @Post('listar-agente')
  listarAgente(@Req() req: CcRequest) {
    const { nit } = this.session(req);
    return this.facade.listarAgente(nit);
  }

  @Post('ver-admin')
  @UseGuards(AuditoriaAdminGuard)
  verAdmin(@Body() dto: IdAuditoriaDto) {
    return this.facade.verAuditoria(dto, 'admin');
  }

  @Post('ver-agente')
  verAgente(@Body() dto: IdAuditoriaDto) {
    return this.facade.verAuditoria(dto, 'agente');
  }

  @Post('editar')
  @UseGuards(AuditoriaAdminGuard)
  editar(@Body() dto: IdAuditoriaDto) {
    return this.facade.verAuditoria(dto, 'editar');
  }

  @Post('upload')
  @UseGuards(AuditoriaAdminGuard)
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            cb(null, UPLOAD_DIR);
          } catch (e) {
            cb(e as Error, UPLOAD_DIR);
          }
        },
        filename: (_req, file, cb) => {
          const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          cb(null, `${Date.now()}_${safe}`);
        },
      }),
    }),
  )
  upload(
    @Req() req: CcRequest,
    @Body() body: { id_auditoria: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { perfil, nit } = this.session(req);
    const idAuditoria = Number(body.id_auditoria);
    if (!Number.isInteger(idAuditoria) || idAuditoria <= 0) {
      throw new BadRequestException('id_auditoria inválido');
    }
    const filenames = (files ?? []).map((f) => f.filename);
    return this.facade.registrarArchivos(idAuditoria, filenames, perfil, nit);
  }

  @Get('indicadores')
  @UseGuards(AuditoriaAdminGuard)
  indicadores() {
    return this.facade.cargarIndicadores();
  }

  @Post('indicadores-puntos')
  @UseGuards(AuditoriaAdminGuard)
  indicadoresPuntos(@Body() dto: IndicadoresPuntosDto) {
    return this.facade.cargarIndicadoresPuntos(dto.id_indicador, dto.estado);
  }

  @Post('update-ind-estado')
  @UseGuards(AuditoriaAdminGuard)
  updateIndEstado(@Req() req: CcRequest, @Body() dto: UpdateIndEstadoDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.updateIndEstado(dto, perfil, nit);
  }

  @Post('update-ind')
  @UseGuards(AuditoriaAdminGuard)
  updateInd(@Req() req: CcRequest, @Body() dto: UpdateIndDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.updateInd(dto, perfil, nit);
  }

  @Post('estado-indicador')
  @UseGuards(AuditoriaAdminGuard)
  estadoIndicador(@Req() req: CcRequest, @Body() dto: EstadoIndicadorDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.estadoIndicador(dto, perfil, nit);
  }

  @Post('items')
  @UseGuards(AuditoriaAdminGuard)
  items(@Body() dto: IdIndicadorDto) {
    return this.facade.getItemsPorIndicador(dto);
  }

  @Post('add-item')
  @UseGuards(AuditoriaAdminGuard)
  addItem(@Req() req: CcRequest, @Body() dto: AddItemDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.addItem(dto, perfil, nit);
  }

  @Post('estado-item')
  @UseGuards(AuditoriaAdminGuard)
  estadoItem(@Req() req: CcRequest, @Body() dto: EstadoItemDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.estadoItem(dto, perfil, nit);
  }

  @Post('items-obs')
  @UseGuards(AuditoriaAdminGuard)
  itemsObs(@Body() dto: IdIndicadorDto) {
    return this.facade.getItemsObs(dto);
  }

  @Post('obs')
  @UseGuards(AuditoriaAdminGuard)
  obs(@Body() dto: IdItemDto) {
    return this.facade.getObsPorItem(dto);
  }

  @Post('add-obs')
  @UseGuards(AuditoriaAdminGuard)
  addObs(@Req() req: CcRequest, @Body() dto: AddObsDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.addObs(dto, perfil, nit);
  }

  @Post('estado-obs')
  @UseGuards(AuditoriaAdminGuard)
  estadoObs(@Req() req: CcRequest, @Body() dto: EstadoObsDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.estadoObs(dto, perfil, nit);
  }

  @Post('send-email')
  @UseGuards(AuditoriaAdminGuard)
  sendEmail(@Req() req: CcRequest, @Body() dto: IdAuditoriaDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.sendEmail(dto, perfil, nit);
  }

  @Post('compromiso')
  compromiso(@Req() req: CcRequest, @Body() dto: CompromisoAgenteDto) {
    const { nit } = this.session(req);
    return this.facade.compromisoAgente(dto, nit);
  }

  @Post('inf-detalle')
  @UseGuards(AuditoriaAdminGuard)
  infDetalle(@Req() req: CcRequest, @Body() dto: InfDetalleDto) {
    const { perfil, nit } = this.session(req);
    return this.facade.cargarInfDetalle(dto, perfil, nit);
  }

  @Get('validate-cant-auditorias')
  @UseGuards(AuditoriaAdminGuard)
  validateCant() {
    return this.facade.validateCantAuditorias();
  }
}
