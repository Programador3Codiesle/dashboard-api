export class TiempoGestionComprasEntity {
  solicitado_por!: string;
  descri_prod!: string;
  area_cargar!: string;
  urgencia!: number;
  fecha_solicitud!: string | null;
  fecha_negada!: string | null;
  fecha_despacho!: string | null;
  estado_actual!: string;
  dias!: number;

  constructor(partial: Partial<TiempoGestionComprasEntity>) {
    Object.assign(this, partial);
  }
}
