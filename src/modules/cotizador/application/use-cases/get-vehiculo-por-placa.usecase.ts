import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ICotizadorLivianosRepository,
  VehiculoCotizacionLivianos,
} from '../../domain/cotizador-livianos.repository';

@Injectable()
export class GetVehiculoPorPlacaUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(
    placa: string,
    empresaId?: number,
  ): Promise<VehiculoCotizacionLivianos> {
    const normalizada = placa.trim().toUpperCase();
    if (!normalizada) {
      throw new NotFoundException('La placa es requerida.');
    }

    const vehiculo = await this.repo.getVehiculoPorPlaca(normalizada);
    if (!vehiculo) {
      throw new NotFoundException(
        'No se encontró información para la placa ingresada.',
      );
    }

    if (empresaId != null) {
      const empresaMarcaId = vehiculo.empresaMarcaId ?? null;
      if (empresaMarcaId != null && empresaMarcaId !== empresaId) {
        // Determinar el nombre legible de la empresa objetivo y la de la placa
        const empresaNombrePorId = (id: number | null): string | null => {
          switch (id) {
            case 1:
              return 'CHEVROLET';
            case 2:
              return 'DIESELCO';
            case 3:
              return 'MITSUBISHI';
            case 4:
              return 'BYD';
            default:
              return null;
          }
        };

        const empresaPlaca =
          empresaNombrePorId(empresaMarcaId) ?? 'otra empresa';
        throw new BadRequestException(
          `Esta placa pertenece a ${empresaPlaca}. Por favor ingresar por ${empresaPlaca} para poder hacer la consulta.`,
        );
      }
    }

    return vehiculo;
  }
}
