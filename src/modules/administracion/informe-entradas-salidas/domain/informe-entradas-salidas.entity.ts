export class InformeEntradasSalidasEntity {
  id_reg_ingreso!: number;
  empleado!: string;
  nombres!: string;
  sede!: string;
  accion!: string;
  fechas!: Date;
  horas!: string;

  constructor(partial: Partial<InformeEntradasSalidasEntity>) {
    Object.assign(this, partial);
  }
}
