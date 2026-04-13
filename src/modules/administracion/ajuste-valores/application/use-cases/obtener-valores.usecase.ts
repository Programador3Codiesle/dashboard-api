import { Injectable } from '@nestjs/common';
import {
  IAjusteValoresRepository,
  RepositoryResponse,
} from '../../domain/ajuste-valores.repository';
import { ResponseAjusteValoresDto } from '../dto/response-ajuste-valores.dto';
import { AjusteValoresMapper } from '../../presentation/mappers/ajuste-valores.mapper';

@Injectable()
export class ObtenerValoresUseCase {
  constructor(private readonly repo: IAjusteValoresRepository) {}

  async execute(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<ResponseAjusteValoresDto>> {
    const response = await this.repo.obtenerValores(tipo, numero);

    if (!response.status || !response.data) {
      return {
        status: false,
        message: response.message,
      };
    }

    // Usar el mapper para convertir Entity → DTO
    return {
      status: true,
      message: response.message,
      data: AjusteValoresMapper.toResponseDto(response.data),
    };
  }

  async obtenerValores2(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<ResponseAjusteValoresDto>> {
    const response = await this.repo.obtenerValores2(tipo, numero);

    if (!response.status || !response.data) {
      return {
        status: false,
        message: response.message,
      };
    }

    return {
      status: true,
      message: response.message,
      data: AjusteValoresMapper.toResponseDto(response.data),
    };
  }

  async obtenerValoresCruce(
    tipo: string,
    numero: number,
  ): Promise<RepositoryResponse<ResponseAjusteValoresDto>> {
    const response = await this.repo.obtenerValoresCruce(tipo, numero);

    if (!response.status || !response.data) {
      return {
        status: false,
        message: response.message,
      };
    }

    return {
      status: true,
      message: response.message,
      data: AjusteValoresMapper.toResponseDto(response.data),
    };
  }

  async validarDocumentosCerrados(
    ano: number,
    mes: number,
  ): Promise<RepositoryResponse<{ cerrado: boolean }>> {
    const response = await this.repo.validarDocumentosCerrados(ano, mes);

    if (!response.status) {
      return {
        status: false,
        message: response.message,
        data: { cerrado: false },
      };
    }

    return {
      status: true,
      message: response.message,
      data: { cerrado: response.data ?? false },
    };
  }
}
