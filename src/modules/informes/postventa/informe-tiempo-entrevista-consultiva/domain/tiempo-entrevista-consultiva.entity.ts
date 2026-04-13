export class TiempoEntrevistaConsultivaResumenRowEntity {
  bodega: number;
  registrosCitas: number;
  citasMarcadas: number;
  citasNoMarcadas: number;
  citasCumplidas: number;
  citasNoCumplidas: number;
  noAsistieron: number;
  otAbiertas: number;
  tiempoEntrevistaConsultiva: number | null;

  constructor(props: TiempoEntrevistaConsultivaResumenRowEntity) {
    Object.assign(this, props);
  }
}

export class TiempoEntrevistaConsultivaDetalleRowEntity {
  idCita: number;
  placa: string;
  fechaCita: string;
  bodega: number;
  horaLlegada: string | null;
  numeroOrdenTaller: number | null;
  horaOrden: string | null;
  tiempoOrden: number | null;

  constructor(props: TiempoEntrevistaConsultivaDetalleRowEntity) {
    Object.assign(this, props);
  }
}
