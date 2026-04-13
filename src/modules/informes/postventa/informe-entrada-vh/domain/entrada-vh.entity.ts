export class InformeEntradaVhResumenEntity {
  anio: number;
  mes: number;

  citasAgendadas: number;
  citasAsistidas: number;
  porcentajeCitasCumplidas: number;

  cantidadTemprano: number;
  cantidadAtiempo: number;
  cantidadTarde: number;
  porcentajeTemprano: number;
  porcentajeAtiempo: number;
  porcentajeTarde: number;

  vhSinCita: number;
  totalIngresos: number;
  porcentajeVhAgendados: number;

  constructor(props: InformeEntradaVhResumenEntity) {
    Object.assign(this, props);
  }
}
