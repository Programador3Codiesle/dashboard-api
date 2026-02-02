import { Injectable, Inject } from "@nestjs/common";
import { AssignJefeDto, CreateJefeDto } from "../../application/dto/assign-jefe.dto";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { IUsuarioJefeRepository } from "../../domain/repositories/usuario-jefe.repository";
import { IUsuarioCoreRepository } from "../../domain/repositories/usuario-core.repository";

/**
 * Use Case para gestión de Jefes
 * Depende de las interfaces IUsuarioJefeRepository e IUsuarioCoreRepository (DIP)
 */
@Injectable()
export class AssignJefeUseCase {
  constructor(
    @Inject(IUsuarioJefeRepository)
    private readonly jefeRepo: IUsuarioJefeRepository,
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async asignarJefe(id: number, dto: AssignJefeDto) {
    const jefeAsignado = await this.jefeRepo.assignJefe(id, dto.jefeId);
    return UsuarioMapper.jefeResponse(jefeAsignado);
  }

  async eliminarJefe(id: number, dto: AssignJefeDto) {
    const jefe = await this.jefeRepo.eliminarJefe(id, dto.jefeId);
    return UsuarioMapper.jefeResponse(jefe);
  }

  async verJefes(id: number) {
    const jefes = await this.jefeRepo.verJefes(id);
    return jefes.map((jefe) => UsuarioMapper.jefeResponse(jefe));
  }

  /**
   * Ver jefes del usuario autenticado, resolviendo primero el id_empleado
   * a partir del NIT (nit_empleado en postv_empleados).
   */
  async verJefesPorNit(nitEmpleado: number) {
    const idEmpleado = await this.coreRepo.obtenerIdEmpleadoPorNit(nitEmpleado);
    if (!idEmpleado) {
      return [];
    }
    const jefes = await this.jefeRepo.verJefes(idEmpleado);
    return jefes.map((jefe) => UsuarioMapper.jefeResponse(jefe));
  }

  async verJefesAll() {
    const jefes = await this.jefeRepo.verJefesAll();
    return jefes.map((jefe) => UsuarioMapper.jefeResponse(jefe));
  }

  async verJefesAllGeneral() {
    const jefes = await this.jefeRepo.verJefesAllGeneral();
    return jefes;
  }

  async verUsuariosJefes() {
    const usuarios = await this.coreRepo.verUsuariosJefes();
    return usuarios.map((usuario) => UsuarioMapper.jefeResponseUsuario(usuario));
  }

  async crearJefe(dto: CreateJefeDto) {
    const jefe = await this.jefeRepo.crearJefe(dto);
    return jefe;
  }
}
