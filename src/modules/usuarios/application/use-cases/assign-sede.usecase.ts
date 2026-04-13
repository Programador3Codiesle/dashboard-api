import { Injectable, Inject } from '@nestjs/common';
import {
  responseSedeDto,
  AssignSedeDto,
} from '../../application/dto/assign-sede.dto';
import { UsuarioMapper } from '../../presentation/mappers/usuario.mapper';
import { IUsuarioSedeRepository } from '../../domain/repositories/usuario-sede.repository';

/**
 * Use Case para gestión de Sedes
 * Depende de la interfaz IUsuarioSedeRepository (DIP - Inversión de Dependencias)
 */
@Injectable()
export class AssignSedeUseCase {
  constructor(
    @Inject(IUsuarioSedeRepository)
    private readonly sedeRepo: IUsuarioSedeRepository,
  ) {}

  /** Ver sedes del usuario */
  async verSedeUsuario(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.sedeRepo.verSedeUsuario(_id);
  }

  /** Ver sedes */
  async verSedes(): Promise<responseSedeDto[]> {
    const sedes = await this.sedeRepo.verSedes();
    return sedes.map((sede) => UsuarioMapper.sedeResponse(sede));
  }

  async asignarSede(idUsuario: number, dto: AssignSedeDto) {
    const sede = await this.sedeRepo.asignarSede(idUsuario, dto.idSede);
    return UsuarioMapper.sedeResponse(sede);
  }

  async eliminarSede(idUsuario: number, dto: AssignSedeDto) {
    const sede = await this.sedeRepo.eliminarSede(idUsuario, dto.idSede);
    return UsuarioMapper.sedeResponse(sede);
  }
}
