export class DesempenoEmpleadoEntity {
  id!: number;
  nitEmpleado!: number;
  empleado!: string;
  area!: string;
  cargo!: string;
  sede!: string;
  fecha!: string;
  calificado!: number;
  jefe!: string;
  calificacionEmpleado!: number;
  calificacionJefe!: number;
  calificacionFinal!: number;
  capacidadesEntrenamiento!: string | null;
  compromisos!: string | null;

  constructor(partial: Partial<DesempenoEmpleadoEntity>) {
    Object.assign(this, partial);
  }
}
