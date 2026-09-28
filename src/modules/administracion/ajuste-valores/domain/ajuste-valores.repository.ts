import { AjusteValoresEntity } from './ajuste-valores.entity';
import {
  FormasPagoDocumento,
  LogAjusteValores,
  RepositoryResponse,
} from './ajuste-valores.interface';

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
  abstract listarFormasPago(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<FormasPagoDocumento>>;
  abstract actualizarDocumento(
    tipo: string,
    numero: number,
    data: Partial<AjusteValoresEntity>,
  ): Promise<RepositoryResponse<boolean>>;
  abstract actualizarFormaPagoPorId(
    tipo: string,
    numero: number,
    id: number,
    formaPago: number | null,
    valor: number | null,
  ): Promise<RepositoryResponse<boolean>>;
  abstract actualizarValorCruce(
    tipo: string,
    numero: number,
    valor: number,
  ): Promise<RepositoryResponse<boolean>>;
  abstract guardarLog(data: LogAjusteValores): Promise<void>;
}
