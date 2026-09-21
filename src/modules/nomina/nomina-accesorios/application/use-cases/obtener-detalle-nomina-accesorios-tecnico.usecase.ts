import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { perfilEn } from '../../../shared/perfil';
import { PERFILES_NOMINA_ACCESORIOS_SIN_FILTRO_NIT } from '../../domain/nomina-accesorios.constants';
import { NominaAccesoriosDetalleTecnicoEntity } from '../../domain/nomina-accesorios.entity';
import { INominaAccesoriosRepository } from '../../domain/nomina-accesorios.repository';

function cellNumber(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (value == null || value === '') return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function cellText(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return value.toString();
  return '';
}

@Injectable()
export class ObtenerDetalleNominaAccesoriosTecnicoUseCase {
  constructor(private readonly repository: INominaAccesoriosRepository) {}

  async execute(input: {
    ano: number;
    mes: number;
    operario: string;
    perfilUsuario: number | null;
    nitUsuarioSesion: number | null;
  }): Promise<NominaAccesoriosDetalleTecnicoEntity[]> {
    const { ano, mes } = input;
    if (!ano || ano < 1) {
      throw new BadRequestException('El parámetro ano es obligatorio.');
    }
    if (!mes || mes < 1 || mes > 12) {
      throw new BadRequestException('El parámetro mes es obligatorio (1-12).');
    }

    const veTodos = perfilEn(
      input.perfilUsuario,
      PERFILES_NOMINA_ACCESORIOS_SIN_FILTRO_NIT,
    );
    let operario = input.operario.trim();
    if (!veTodos) {
      if (
        !Number.isFinite(input.nitUsuarioSesion) ||
        !input.nitUsuarioSesion ||
        input.nitUsuarioSesion <= 0
      ) {
        throw new BadRequestException(
          'No se pudo determinar el usuario de sesión.',
        );
      }
      const propio = String(input.nitUsuarioSesion);
      if (operario && operario !== propio) {
        throw new ForbiddenException(
          'Solo puede consultar el detalle de sus comisiones.',
        );
      }
      operario = propio;
    }
    if (!operario) {
      throw new BadRequestException('El operario es obligatorio.');
    }

    try {
      const rows = await this.repository.listarDetalleTecnico(
        ano,
        mes,
        operario,
      );
      return rows.map(
        (row) =>
          new NominaAccesoriosDetalleTecnicoEntity({
            numeroOrden: cellNumber(row, 'numero_orden'),
            operacion: cellText(row, 'operacion'),
            descripcion: cellText(row, 'descripcion'),
            tiempo: cellNumber(row, 'tiempo'),
          }),
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al consultar el detalle de comisiones. Contacte al departamento de Sistemas.',
      );
    }
  }
}
