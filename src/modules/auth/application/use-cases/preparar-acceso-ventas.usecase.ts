import { Injectable } from '@nestjs/common';
import { decryptLegacyPassword } from '../../../../core/infra/crypto/legacy-password';
import { IUserRepository } from '../../domain/user.repository';

export type AccesoVentasResult =
  | { listo: true; nit: number; contra: string }
  | { listo: false };

@Injectable()
export class PrepararAccesoVentasUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(nit: number): Promise<AccesoVentasResult> {
    const cifrada = await this.users.findPassCifradaByNit(nit);
    if (!cifrada) return { listo: false };
    const contra = decryptLegacyPassword(cifrada);
    if (!contra) return { listo: false };
    return { listo: true, nit, contra };
  }
}
