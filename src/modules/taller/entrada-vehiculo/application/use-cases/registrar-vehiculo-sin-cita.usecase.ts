import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { IEntradaVehiculoRepository } from '../../domain/entrada-vehiculo.repository';

@Injectable()
export class RegistrarVehiculoSinCitaUseCase {
  constructor(private readonly repo: IEntradaVehiculoRepository) {}

  async execute(
    nitUsuario: number,
    placa: string,
    cliente: string,
    motivo: string,
    bodega: number,
  ): Promise<{ ok: boolean }> {
    const placaNorm = placa.trim().toUpperCase();
    const clienteNorm = cliente.trim().toUpperCase();
    const motivoNorm = motivo.trim();

    if (!placaNorm || !clienteNorm || !motivoNorm) {
      throw new BadRequestException('Por favor llene todos los campos');
    }

    if (placaNorm.length !== 6) {
      throw new BadRequestException(
        'El número de dígitos de la placa no coincide',
      );
    }

    const sedes = await this.repo.getSedesUsuario(nitUsuario);
    const bodegasPermitidas = new Set(sedes.map((s) => s.idsede));
    if (!bodegasPermitidas.has(bodega)) {
      throw new ForbiddenException('Bodega no permitida para el usuario');
    }

    const ok = await this.repo.insertVhSinCita(
      placaNorm,
      clienteNorm,
      motivoNorm,
      bodega,
    );
    return { ok };
  }
}
