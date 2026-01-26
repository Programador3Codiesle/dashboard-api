// usuario.entity.ts

/**
 * Entidad de Usuario
 * Representa un usuario del sistema con sus propiedades principales
 */
export class UsuarioEntity {
  id?: string;
  id_empleado?: string;
  nombre!: string;
  nombresCompletos?: string;
  nit?: string;
  perfil?: string;
  estado?: string;
  sede?: string;
  empresa?: string;
  email!: string;
  telefono?: string;
  rol!: string;
  createdAt?: Date;
  updatedAt?: Date;
  empresas?: string[];
  id_empresa?: string;

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

/**
 * Entidad de Jefe
 * Representa un jefe/supervisor en el sistema
 */
export class JefesEntity {
  id!: string;
  nombre?: string;
  nit?: string;
  email?: string;

  constructor(props: Partial<JefesEntity>) {
    Object.assign(this, props);
  }
}

/**
 * Entidad de Sede
 * Representa una sede/ubicación física
 */
export class SedesEntity {
  id!: string;
  nombre?: string;

  constructor(props: Partial<SedesEntity>) {
    Object.assign(this, props);
  }
}

/**
 * Entidad de Perfil
 * Representa un perfil/rol de usuario
 */
export class PerfilesEntity {
  id!: string;
  nombre?: string;

  constructor(props: Partial<PerfilesEntity>) {
    Object.assign(this, props);
  }
}

/**
 * Entidad de Horario
 * Representa el horario laboral de un empleado
 */
export class HorarioEntity {
  id!: string;
  sede?: string;
  hora_ent_sem_am?: string;
  hora_sal_sem_am?: string;
  hora_ent_sem_pm?: string;
  hora_sal_sem_pm?: string;
  hora_ent_am_viernes?: string;
  hora_sal_am_viernes?: string;
  hora_ent_pm_viernes?: string;
  hora_sal_pm_viernes?: string;
  hora_ent_viernes_pm?: string;
  hora_sal_viernes?: string;
  hora_ent_fds?: string;
  hora_sal_fds?: string;

  constructor(props: Partial<HorarioEntity>) {
    Object.assign(this, props);
  }
}
