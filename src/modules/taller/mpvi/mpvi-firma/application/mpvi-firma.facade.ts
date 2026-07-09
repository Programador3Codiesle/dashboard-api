import { Injectable } from '@nestjs/common';
import { ValidarTokenUseCase } from './use-cases/validar-token.usecase';
import { CargarFirmaUseCase } from './use-cases/cargar-firma.usecase';
import { ImprimirMpviClienteUseCase } from './use-cases/imprimir-mpvi-cliente.usecase';
import type { CargarFirmaDto } from './dto/mpvi-firma.dto';

@Injectable()
export class MpviFirmaFacade {
  constructor(
    private readonly validarTokenUC: ValidarTokenUseCase,
    private readonly cargarFirmaUC: CargarFirmaUseCase,
    private readonly imprimirMpviClienteUC: ImprimirMpviClienteUseCase,
  ) {}

  validarToken(token: string) {
    return this.validarTokenUC.execute(token);
  }

  cargarFirma(dto: CargarFirmaDto, imgFirmaFile?: Express.Multer.File) {
    const llave = dto.llave || dto.token || '';
    return this.cargarFirmaUC.execute({
      opcion: dto.opcion,
      llave,
      dataForm: dto.dataForm,
      imgFirmaBase64: dto.img_firma_user,
      imgFirmaFile,
    });
  }

  imprimirMpviCliente(token: string) {
    return this.imprimirMpviClienteUC.execute(token);
  }
}
