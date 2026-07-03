import { Injectable } from '@nestjs/common';
import { SubirPlantillaMpviUseCase } from './use-cases/subir-plantilla-mpvi.usecase';
import { SubirTablasAuxiliaresUseCase } from './use-cases/subir-tablas-auxiliares.usecase';
import {
  CatalogoTipo,
  ListarCatalogoMpviUseCase,
} from './use-cases/listar-catalogo-mpvi.usecase';
import { GuardarElementoCatalogoUseCase } from './use-cases/guardar-elemento-catalogo.usecase';
import { GuardarElementoCatalogoDto } from './dto/mpvi-admin.dto';

@Injectable()
export class MpviAdminFacade {
  constructor(
    private readonly subirPlantillaUC: SubirPlantillaMpviUseCase,
    private readonly subirTablasUC: SubirTablasAuxiliaresUseCase,
    private readonly listarCatalogoUC: ListarCatalogoMpviUseCase,
    private readonly guardarElementoUC: GuardarElementoCatalogoUseCase,
  ) {}

  subirPlantilla(buffer: Buffer) {
    return this.subirPlantillaUC.execute(buffer);
  }

  subirTablasAuxiliares(buffer: Buffer, tabla: number) {
    return this.subirTablasUC.execute(buffer, tabla);
  }

  listarCatalogo(tipo: CatalogoTipo) {
    return this.listarCatalogoUC.execute(tipo);
  }

  guardarElemento(dto: GuardarElementoCatalogoDto) {
    return this.guardarElementoUC.execute(dto.op, dto.data);
  }
}
