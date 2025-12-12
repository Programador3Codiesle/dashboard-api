import { UsuarioEntity } from "./usuario.entity";

export abstract class IUsuarioRepository {
  abstract findAll(): Promise<UsuarioEntity[]>;
  abstract findById(id: number): Promise<UsuarioEntity | null>;
  abstract create(data: any): Promise<UsuarioEntity>;
  abstract update(id: number, data: any): Promise<UsuarioEntity>;

  abstract assignSede(id: number, sede: string): Promise<UsuarioEntity>;
  abstract assignJefe(id: number, jefeId: number): Promise<UsuarioEntity>;
  abstract assignHorario(id: number, horarioId: number): Promise<UsuarioEntity>;
  abstract assignEmpresa(id: string, empresaId: string[]): Promise<UsuarioEntity>;
  abstract findEmpresasByUsuario(cedula: string): Promise<{ id_empresa: number }[]>;
  abstract addEmpresasSafe(cedula: string, empresasIds: string[]): Promise<string[]>;
  abstract existsEmpresa(id: string): Promise<boolean>;
  abstract transaction<T>(fn: () => Promise<T>): Promise<T>;
}
