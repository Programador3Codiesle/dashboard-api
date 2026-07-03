import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';
import { MpviLinkService } from '../../../mpvi-shared/application/mpvi-link.service';

function parseFormData(dataForm: string): Record<string, string> {
  const result: Record<string, string> = {};
  new URLSearchParams(dataForm).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

@Injectable()
export class CargarFirmaUseCase {
  constructor(
    private readonly repo: IMpviCotizacionRepository,
    private readonly linkService: MpviLinkService,
  ) {}

  async execute(params: {
    opcion: number;
    llave: string;
    dataForm?: string;
    imgFirmaBase64?: string;
    imgFirmaFile?: Express.Multer.File;
  }) {
    const token = params.llave;
    const decoded = this.linkService.validarToken(token);
    const idCotizacion = decoded.idCotizacion;
    const op = params.opcion;

    const parsed = params.dataForm ? parseFormData(params.dataForm) : {};
    const arrayFiltrado = Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => value !== ''),
    );

    let resImg: number | string | null = null;
    if (op > 0) {
      resImg = await this.guardarImagen(
        op,
        `${idCotizacion}_firma`,
        params.imgFirmaFile,
        params.imgFirmaBase64,
      );
    }

    const payload: Record<string, unknown> = {
      ...arrayFiltrado,
      id_cotizacion: idCotizacion,
      opcion: op,
    };

    const resLog = await this.repo.guardarRegistroFirma(payload);
    const res = op > 0 ? resImg : resLog != null ? 1 : null;

    return { ok: res === 1 || res === '1', result: res };
  }

  private async guardarImagen(
    op: number,
    nombre: string,
    file?: Express.Multer.File,
    base64?: string,
  ): Promise<number | string> {
    const dir = path.resolve(process.cwd(), 'media', 'firmasClientes');
    await fs.mkdir(dir, { recursive: true });

    if (op === 2) {
      if (!file?.buffer) {
        return 'Hubo un error al guardar la imagen';
      }
      const ext = path.extname(file.originalname) || '.png';
      const filePath = path.join(dir, `${nombre}${ext}`);
      await fs.writeFile(filePath, file.buffer);
      return 1;
    }

    if (!base64) {
      return 'Hubo un error al guardar la imagen';
    }

    const parts = base64.split(',');
    const data = parts.length > 1 ? parts[1] : parts[0];
    const buffer = Buffer.from(data, 'base64');
    const filePath = path.join(dir, `${nombre}.png`);
    await fs.writeFile(filePath, buffer);
    return 1;
  }
}
