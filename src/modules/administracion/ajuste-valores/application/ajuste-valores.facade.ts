import { Injectable } from '@nestjs/common';
import { ObtenerValoresUseCase } from './use-cases/obtener-valores.usecase';
import { ActualizarValoresUseCase } from './use-cases/actualizar-valores.usecase';
import { UpdateAjusteValoresDto } from './dto/update-ajuste-valores.dto';

@Injectable()
export class AjusteValoresFacade {
  constructor(
    private readonly obtenerValoresUC: ObtenerValoresUseCase,
    private readonly actualizarValoresUC: ActualizarValoresUseCase,
  ) {}

  obtenerValores(tipo: string, numero: number) {
    return this.obtenerValoresUC.execute(tipo, numero);
  }

  obtenerValores2(tipo: string, numero: number) {
    return this.obtenerValoresUC.obtenerValores2(tipo, numero);
  }

  obtenerValoresCruce(tipo: string, numero: number) {
    return this.obtenerValoresUC.obtenerValoresCruce(tipo, numero);
  }

  validarDocumentosCerrados(ano: number, mes: number) {
    return this.obtenerValoresUC.validarDocumentosCerrados(ano, mes);
  }

  actualizarValores(numero: number, tipo: string, dto: UpdateAjusteValoresDto) {
    return this.actualizarValoresUC.execute(numero, tipo, dto);
  }
}
