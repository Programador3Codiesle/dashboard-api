export class TallaDotacionEntity {
  usuario_id: number;
  genero?: string | null;
  talla_camisa?: string | null;
  talla_pantalon?: string | null;
  talla_botas?: string | null;
  ultima_actualizacion?: Date | null;
  id_empresa?: number | null;

  constructor(partial: Partial<TallaDotacionEntity>) {
    Object.assign(this, partial);
  }
}
