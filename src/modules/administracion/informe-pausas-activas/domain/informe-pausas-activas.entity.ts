export class InformePausasActivasEntity {
  nit_empleado?: string | null;
  nombres?: string | null;
  sede?: string | null;
  fecha_am?: Date | null;
  fecha_pm?: Date | null;

  constructor(partial: Partial<InformePausasActivasEntity>) {
    Object.assign(this, partial);
  }
}

