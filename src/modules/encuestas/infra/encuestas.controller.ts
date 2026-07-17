import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Body,
  Query,
  Req,
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

const CODIESEL_EMPRESA_ID = 1;

type AuthRequest = {
  user?: { sub?: number | string; nit?: number | string; role?: number | string };
  cookies?: Record<string, string>;
};

function assertCodieselEmpresa(req: AuthRequest): number {
  let empresa: number | null = null;

  if (req.cookies?.['user']) {
    try {
      const userCookie = JSON.parse(req.cookies['user']) as {
        empresa?: number | string;
      };
      if (userCookie?.empresa != null) {
        empresa = Number(userCookie.empresa);
      }
    } catch {
      /* ignore */
    }
  }

  if (empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este módulo solo está disponible para Codiesel',
    );
  }
  return empresa;
}

const EXCEL_UPLOAD = FileInterceptor('fileContacts', {
  storage: memoryStorage(),
});

@Controller('encuestas')
@UseGuards(JwtAuthGuard)
export class EncuestasController {
  constructor(private readonly facade: EncuestasFacade) {}

  @Get('satisfaccion')
  listarSatisfaccion(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.listarSatisfaccion();
  }

  @Get('satisfaccion/detalle')
  detalleSatisfaccion(
    @Req() req: AuthRequest,
    @Query('ot') ot: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.detalleSatisfaccion(ot);
  }

  @Get('nps-colmotores/tecnicos')
  listarTecnicos(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.listarTecnicosNps();
  }

  @Post('nps-colmotores/sede')
  insertNpsSede(@Req() req: AuthRequest, @Body() dto: NpsSedeDto) {
    assertCodieselEmpresa(req);
    return this.facade.insertNpsSede(dto);
  }

  @Post('nps-colmotores/tecnico')
  insertNpsTecnico(@Req() req: AuthRequest, @Body() dto: NpsTecnicoDto) {
    assertCodieselEmpresa(req);
    return this.facade.insertNpsTecnico({
      ...dto,
      tipificacion: dto.tipificacion ?? 'Ninguno',
    });
  }

  @Post('nps-tecnicos/upload')
  @UseInterceptors(EXCEL_UPLOAD)
  async uploadNpsTecnicos(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    assertCodieselEmpresa(req);
    if (!file?.buffer) {
      throw new BadRequestException('Archivo requerido');
    }
    return this.facade.uploadNpsTecnicos(file.buffer);
  }

  @Get('nps-tecnicos/plantilla')
  async descargarPlantilla(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    assertCodieselEmpresa(req);
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
