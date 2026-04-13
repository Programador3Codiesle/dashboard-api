export class PqrNpsItemEntity {
  pqrNpsId!: number | null;
  fuente!: string;
  id!: number;
  sede!: string;
  area!: string;
  fecha!: string;
  placa!: string;
  cliente!: string;
  modeloVh!: string;
  orden!: string;
  mail!: string;
  telefono!: string;
  servicio!: string | null;
  satisfaccionConcesionario!: string | null;
  satisfaccionTrabajo!: string | null;
  vhReparadoOk!: string | null;
  recomendacionMarca!: string | null;
  comentarios!: string | null;
  tecnico!: string;
  tipificacionEncuesta!: string | null;
  contactoCliente!: string | null;
  estadoCaso!: string | null;
  comentariosFinalCaso!: string | null;
  tipificacionCierre!: string | null;

  constructor(partial: Partial<PqrNpsItemEntity>) {
    Object.assign(this, partial);
  }
}

export class PqrNpsGestionEntity {
  id!: number;
  postVenta!: number;
  fuente!: string;
  estadoCaso!: string;
  tipificacionEncuesta!: string;
  tipificacionCierre!: string;
  comentariosFinalCaso!: string;

  constructor(partial: Partial<PqrNpsGestionEntity>) {
    Object.assign(this, partial);
  }
}

export class PqrNpsVerbalizacionEntity {
  contacto!: string;
  verbalizacion!: string;
  fechaContacto!: string;

  constructor(partial: Partial<PqrNpsVerbalizacionEntity>) {
    Object.assign(this, partial);
  }
}

export class PqrNpsVehiculoInfoEntity {
  serie!: string;
  modelo!: string;
  nombres!: string;
  nit!: string;
  mail!: string;
  celular!: string;

  constructor(partial: Partial<PqrNpsVehiculoInfoEntity>) {
    Object.assign(this, partial);
  }
}

export class PqrNpsTecnicoEntity {
  documento!: string;
  nombre!: string;

  constructor(partial: Partial<PqrNpsTecnicoEntity>) {
    Object.assign(this, partial);
  }
}
