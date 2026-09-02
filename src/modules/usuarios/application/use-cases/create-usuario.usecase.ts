import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';
import { encryptLegacyPassword } from '../crypto/encrypt-legacy-password';

/**
 * Use Case para creación de Usuario
 * Depende de la interfaz IUsuarioCoreRepository (DIP - Inversión de Dependencias)
 */
@Injectable()
export class CreateUsuarioUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async crearUsuario(dto: CreateUsuarioDto) {
    // Validar que el nit no exista
    const usuarioExiste = await this.coreRepo.verUsuarioPorNit(dto.nit);
    if (usuarioExiste) {
      throw new BadRequestException(`El nit ${dto.nit} ya existe`);
    }

    // Validar que el tercero exista
    const terceroExiste = await this.coreRepo.verTercero(dto.nit);
    if (!terceroExiste) {
      throw new BadRequestException(`El tercero ${dto.nit} no existe`);
    }

    const passwordRaw = String(dto.nit);
    const encryptedPassword = encryptLegacyPassword(passwordRaw);

    const data = {
      nit: dto.nit,
      encryptedPassword,
      perfil: dto.perfil,
      estado: 1,
      num_intentos: 0,
      clave: 0,
      tipo_tercero: '1',
      fid_perfil: '31',
    };

    const usuario = await this.coreRepo.crearUsuario(data);
    return usuario;
  }
}
