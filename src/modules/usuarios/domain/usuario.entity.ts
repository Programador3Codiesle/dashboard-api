// usuario.entity.ts
export class UsuarioEntity {
  id?: string;
  nombre: string;
  nombresCompletos?: string;  // De terceros.nombres
  nit?: string;               // NIT del usuario
  perfil?: string;            // Nombre del perfil (postv_perfiles.nom_perfil)
  estado?: string;            // Estado del usuario
  sede?: string;              // Sede asignada (postv_horarios_empleados.sede)
  empresa?: string;           // Empresa asignada (sw_empresa_usuario.idEmpresa)
  email: string;
  telefono?: string;
  rol: string;
  createdAt?: Date;
  updatedAt?: Date;

  empresas?: string[];
  id_empresa: string;

  constructor(props: Partial<UsuarioEntity>) {
    Object.assign(this, props);
  }

  // Métodos de negocio
  estaActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  tieneSedeAsignada(): boolean {
    return !!this.sede && this.sede.trim() !== '';
  }
}


