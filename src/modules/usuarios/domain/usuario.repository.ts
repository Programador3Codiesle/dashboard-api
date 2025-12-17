import { UsuarioEntity, JefesEntity, SedesEntity, PerfilesEntity, HorarioEntity } from "./usuario.entity";
import { AssignHorarioDto } from "../application/dto/assign-horario.dto";
import { AssignEmpresaDto } from "../application/dto/assign-empresa.dto";
import { CreateJefeDto } from "../application/dto/assign-jefe.dto";


export abstract class IUsuarioRepository {
  abstract findAll(): Promise<UsuarioEntity[]>;

  abstract crearUsuario(data: any): Promise<{success: boolean; message: string }>;
  abstract verUsuarioPorNit(nit: string): Promise<boolean>;
  abstract verTercero(nit: string): Promise<boolean>;





  abstract updateUsuario(id: number, data: any): Promise<PerfilesEntity>;
  abstract listarPerfiles(): Promise<PerfilesEntity[]>;
  abstract listarPerfilUsuario(id: number): Promise<PerfilesEntity[]>;

  abstract verSedeUsuario(id: number): Promise<SedesEntity[]>;
  abstract verSedes(): Promise<SedesEntity[]>;
  abstract asignarSede(idSede: number, idUsuario: number): Promise<SedesEntity>;
  abstract eliminarSede(idSede: number, idUsuario: number): Promise<SedesEntity>;

  abstract verJefes(id: number): Promise<JefesEntity[]>;
  abstract verJefesAll(): Promise<JefesEntity[]>;
  abstract assignJefe(id: number, jefeId: number): Promise<JefesEntity>;
  abstract eliminarJefe(id: number, jefeId: number): Promise<JefesEntity>;

  abstract verHorario(id: number): Promise<HorarioEntity>;
  abstract assignHorario(id: number, dto: AssignHorarioDto): Promise<HorarioEntity>;
  abstract updateHorario(id: number, dto: AssignHorarioDto): Promise<HorarioEntity>;

  abstract assignEmpresa(id: string, empresaId: string[]): Promise<UsuarioEntity>;
  abstract findEmpresasByUsuario(cedula: string): Promise<{ id_empresa: number }[]>;
  abstract addEmpresasSafe(cedula: string, empresasIds: string[]): Promise<string[]>;
  abstract existsEmpresa(id: string): Promise<boolean>;
  abstract transaction<T>(fn: () => Promise<T>): Promise<T>;
  abstract eliminarEmpresa(idUsuario: number, dto: AssignEmpresaDto): Promise<{ success: boolean; message: string }>;

  abstract resetPassword(id: number, encryptedPassword: string): Promise<{ success: boolean; message: string }>;
  
  abstract deshabilitar(id: number): Promise<{ success: boolean; message: string }>;
  abstract habilitar(id: number): Promise<{ success: boolean; message: string }>;

  abstract verJefesAllGeneral(): Promise<JefesEntity[]>;
  abstract verUsuariosJefes(): Promise<UsuarioEntity[]>;
  abstract crearJefe(dto: CreateJefeDto): Promise<{ success: boolean; message: string }>;

}
