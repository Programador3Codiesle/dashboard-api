export class PqrNpsItemEntity {
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
  servicio!: number | null;
  satisfaccionConcesionario!: number | null;
  satisfaccionTrabajo!: number | null;
  vhReparadoOk!: number | null;
  recomendacionMarca!: number | null;
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

