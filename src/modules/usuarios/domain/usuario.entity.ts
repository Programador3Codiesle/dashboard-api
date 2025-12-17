// usuario.entity.ts
export class UsuarioEntity {
  id?: string;
  id_empleado?: string;
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

export class JefesEntity {
  id: string;
  nombre: string;
  nit: string;
  email: string;

  constructor(props: Partial<JefesEntity>) {
    Object.assign(this, props);
  }
}

export class SedesEntity {
  id: string;
  nombre: string;

  constructor(props: Partial<SedesEntity>) {
    Object.assign(this, props);
  }
}


export class PerfilesEntity {
  id: string;
  nombre: string;

  constructor(props: Partial<PerfilesEntity>) {
    Object.assign(this, props);
  }
}

export class HorarioEntity {
  id: string;
  sede: string;
  hora_ent_sem_am: string;
  hora_sal_sem_am: string;

  hora_ent_sem_pm: string;
  hora_sal_sem_pm: string;

  hora_ent_am_viernes: string;
  hora_sal_am_viernes: string;

  hora_ent_pm_viernes: string;
  hora_sal_pm_viernes: string;

  hora_ent_fds: string;
  hora_sal_fds: string;

  constructor(props: Partial<HorarioEntity>) {
    Object.assign(this, props);
  }
}
