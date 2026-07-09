import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MESES_LEGACY } from '../../domain/constants/meses-legacy.constants';
import { GraficoResponseEntity } from '../../domain/entities/informe-posibles-retornos.entity';
import { IInformePosiblesRetornosRepository } from '../../domain/repositories/informe-posibles-retornos.repository.interface';
import { GetGraficoDto } from '../dto/get-grafico.dto';

@Injectable()
export class GetGraficoUseCase {
  constructor(
    private readonly repository: IInformePosiblesRetornosRepository,
  ) {}

  async execute(dto: GetGraficoDto): Promise<GraficoResponseEntity> {
    const tecnico = dto.tecnico?.trim() ?? '';
    const sede = dto.sede;

    if (tecnico && sede) {
      throw new BadRequestException(
        'No se puede filtrar por técnico y sede simultáneamente',
      );
    }

    let rows;

    if (tecnico && !sede) {
      const nameTecnico = await this.repository.getNameTecnico(tecnico);
      if (!nameTecnico) {
        throw new NotFoundException('Técnico no encontrado');
      }
      rows = await this.repository.entradaVsRetornosByTecnico(
        dto.year,
        tecnico,
        nameTecnico,
      );
    } else if (!tecnico && sede) {
      rows = await this.repository.entradaVsRetornosBySede(dto.year, sede);
    } else {
      rows = await this.repository.entradaVsRetornos(dto.year);
    }

    if (!rows.length) {
      return { response: 'error' };
    }

    const entradasPoints: { label: string; y: number }[] = [];
    const retornosPoints: { label: string; y: number }[] = [];
    const posiblesPoints: { label: string; y: number }[] = [];

    for (const row of rows) {
      const label = MESES_LEGACY[row.mes] ?? '';
      entradasPoints.push({ label, y: row.entradas });
      retornosPoints.push({ label, y: row.retornos });
      posiblesPoints.push({ label, y: row.posibles_retornos });
    }

    return {
      response: 'success',
      entradas: entradasPoints,
      retornos: retornosPoints,
      posibles: posiblesPoints,
    };
  }
}
