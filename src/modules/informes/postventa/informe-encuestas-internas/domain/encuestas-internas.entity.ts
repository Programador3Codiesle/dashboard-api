export class EncuestaInternaRowEntity {
  numeroOrden: number;
  bodega: string;
  fechaOt: string;
  horaOt: string;
  placa: string;
  nit: string;
  cliente: string;
  celular: string | null;
  telefono1: string | null;
  telefono2: string | null;
  correo: string | null;
  fechaEncuesta: string;
  calificacion: string;

  constructor(props: EncuestaInternaRowEntity) {
    Object.assign(this, props);
  }
}
