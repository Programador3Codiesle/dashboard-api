import { AjusteValoresEntity } from './ajuste-valores.entity';
import { RepositoryResponse } from './ajuste-valroes.interface';

// Re-exportar RepositoryResponse para que pueda ser importado desde este módulo
export type { RepositoryResponse };

export abstract class IAjusteValoresRepository {
  abstract obtenerValores(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<AjusteValoresEntity>>;
  abstract obtenerValores2(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<AjusteValoresEntity>>;
  abstract obtenerValoresCruce(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<AjusteValoresEntity>>;
  abstract validarDocumentosCerrados(
    ano: number,
    mes: number,
  ): Promise<RepositoryResponse<boolean>>;
  abstract actualizarValores(
    numero: number,
    tipo: string,
    data: Partial<AjusteValoresEntity>,
  ): Promise<RepositoryResponse<AjusteValoresEntity>>;
}
