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
  agentes(@Req() req: CcRequest) {
    const { perfil } = this.session(req);
    return this.facade.getAgentes(perfil);
  }

  @Get('cant-preguntas')
  cantPreguntas(@Req() req: CcRequest) {
    const { perfil } = this.session(req);
    return this.facade.getCantPreguntas(perfil);
  }

  @Get('contexto')
  contexto(@Req() req: CcRequest) {
    const { perfil } = this.session(req);
    return this.facade.getContextoListado(perfil);
  }

  @Post('crear')
  crear(@Req() req: CcRequest, @Body() dto: CrearAuditoriaDto) {
    const { nit } = this.session(req);
    return this.facade.crearAuditoria(dto, nit);
  }

  @Post('formulario-vista-previa')
  formularioVistaPrevia(@Body() dto: FormAuditoriaDto) {
    return this.facade.cargarFormulario(dto, true);
  }

  @Post('formulario')
  formulario(@Body() dto: FormAuditoriaDto) {
    return this.facade.cargarFormulario(dto, true);
  }

  @Post('update-respuesta')
  updateRespuesta(@Body() dto: UpdateRespuestaDto) {
    return this.facade.updateRespuesta(dto);
  }

  @Post('finalizar')
  finalizar(@Body() dto: FinalizarAuditoriaDto) {
    return this.facade.finalizarAuditoria(dto);
  }

  @Post('listar-admin')
  listarAdmin(@Req() req: CcRequest, @Body() dto: ListarAuditoriasDto) {
    const { perfil } = this.session(req);
    return this.facade.listarAdmin(dto, perfil);
  }

  @Post('listar-agente')
  listarAgente(@Req() req: CcRequest) {
    const { nit } = this.session(req);
    return this.facade.listarAgente(nit);
  }

  @Post('ver-admin')
  verAdmin(@Body() dto: IdAuditoriaDto) {
    return this.facade.verAuditoria(dto, 'admin');
  }

  @Post('ver-agente')
  verAgente(@Body() dto: IdAuditoriaDto) {
    return this.facade.verAuditoria(dto, 'agente');
  }

  @Post('editar')
  editar(@Body() dto: IdAuditoriaDto) {
    return this.facade.verAuditoria(dto, 'editar');
  }

  @Post('upload')
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
    @Body() body: { id_auditoria: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const idAuditoria = Number(body.id_auditoria);
    if (!Number.isInteger(idAuditoria) || idAuditoria <= 0) {
      throw new BadRequestException('id_auditoria inválido');
    }
    const filenames = (files ?? []).map((f) => f.filename);
    return this.facade.registrarArchivos(idAuditoria, filenames);
  }

  @Get('indicadores')
  indicadores() {
    return this.facade.cargarIndicadores();
  }

  @Post('indicadores-puntos')
  indicadoresPuntos(@Body() dto: IndicadoresPuntosDto) {
    return this.facade.cargarIndicadoresPuntos(dto.id_indicador, dto.estado);
  }

  @Post('update-ind-estado')
  updateIndEstado(@Req() req: CcRequest, @Body() dto: UpdateIndEstadoDto) {
    const { perfil } = this.session(req);
    return this.facade.updateIndEstado(dto, perfil);
  }

  @Post('update-ind')
  updateInd(@Req() req: CcRequest, @Body() dto: UpdateIndDto) {
    const { perfil } = this.session(req);
    return this.facade.updateInd(dto, perfil);
  }

  @Post('estado-indicador')
  estadoIndicador(@Req() req: CcRequest, @Body() dto: EstadoIndicadorDto) {
    const { perfil } = this.session(req);
    return this.facade.estadoIndicador(dto, perfil);
  }

  @Post('items')
  items(@Body() dto: IdIndicadorDto) {
    return this.facade.getItemsPorIndicador(dto);
  }

  @Post('add-item')
  addItem(@Req() req: CcRequest, @Body() dto: AddItemDto) {
    const { perfil } = this.session(req);
    return this.facade.addItem(dto, perfil);
  }

  @Post('estado-item')
  estadoItem(@Req() req: CcRequest, @Body() dto: EstadoItemDto) {
    const { perfil } = this.session(req);
    return this.facade.estadoItem(dto, perfil);
  }

  @Post('items-obs')
  itemsObs(@Body() dto: IdIndicadorDto) {
    return this.facade.getItemsObs(dto);
  }

  @Post('obs')
  obs(@Body() dto: IdItemDto) {
    return this.facade.getObsPorItem(dto);
  }

  @Post('add-obs')
  addObs(@Req() req: CcRequest, @Body() dto: AddObsDto) {
    const { perfil } = this.session(req);
    return this.facade.addObs(dto, perfil);
  }

  @Post('estado-obs')
  estadoObs(@Req() req: CcRequest, @Body() dto: EstadoObsDto) {
    const { perfil } = this.session(req);
    return this.facade.estadoObs(dto, perfil);
  }

  @Post('send-email')
  sendEmail(@Req() req: CcRequest, @Body() dto: IdAuditoriaDto) {
    const { perfil } = this.session(req);
    return this.facade.sendEmail(dto, perfil);
  }

  @Post('compromiso')
  compromiso(@Req() req: CcRequest, @Body() dto: CompromisoAgenteDto) {
    const { nit } = this.session(req);
    return this.facade.compromisoAgente(dto, nit);
  }

  @Post('inf-detalle')
  infDetalle(@Req() req: CcRequest, @Body() dto: InfDetalleDto) {
    const { perfil } = this.session(req);
    return this.facade.cargarInfDetalle(dto, perfil);
  }

  @Get('validate-cant-auditorias')
  validateCant() {
    return this.facade.validateCantAuditorias();
  }
}
