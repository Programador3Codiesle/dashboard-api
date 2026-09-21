import { Injectable } from '@nestjs/common';
import { ListarNominaAccesoriosUseCase } from './use-cases/listar-nomina-accesorios.usecase';
import { ObtenerDetalleNominaAccesoriosTecnicoUseCase } from './use-cases/obtener-detalle-nomina-accesorios-tecnico.usecase';

@Injectable()
export class NominaAccesoriosFacade {
  constructor(
    private readonly listarUseCase: ListarNominaAccesoriosUseCase,
    private readonly detalleTecnicoUseCase: ObtenerDetalleNominaAccesoriosTecnicoUseCase,
  ) {}

  listar(input: {
    ano: number;
    mes: number;
    tipo: number;
    perfilUsuario: number | null;
    nitUsuarioSesion: number | null;
  }) {
    return this.listarUseCase.execute(input);
  }

  detalleTecnico(input: {
    ano: number;
    mes: number;
    operario: string;
    perfilUsuario: number | null;
    nitUsuarioSesion: number | null;
  }) {
    return this.detalleTecnicoUseCase.execute(input);
  }
}
