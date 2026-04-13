export class GestionCompraEntity {
  id_solicitud?: bigint;
  fecha_solicitud: Date;
  area: string;
  sede: string;
  usu_solicita: number;
  cargo_usu_solicita: string;
  gerente_autoriza: number;
  descri_prod: string;
  caracteristicas?: string;
  proveedor?: string;
  area_cargar?: string;
  urgencia: number;
  fecha_tentativa: Date;
  estado: number;
  fecha_autorizacion?: Date | null;
  cotizacion_file?: string | null;
  estado_autorizacion: number;
  con_factura?: string | null;
  id_empresa?: number | null;

  constructor(partial: Partial<GestionCompraEntity>) {
    Object.assign(this, partial);
  }
}
