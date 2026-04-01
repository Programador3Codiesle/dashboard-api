export class Ventas1a1RowEntity {
  anio: number;
  nitAsesor: string;
  asesor: string;
  ventaManoObra: number;
  ventaRepuestos: number;
  costoRepuestos: number;
  utilidad: number;
  porcentajeConversion: number | null;

  constructor(props: Ventas1a1RowEntity) {
    Object.assign(this, props);
  }
}

export class Ventas1a1AsesorEntity {
  nitAsesor: string;
  asesor: string;

  constructor(props: Ventas1a1AsesorEntity) {
    Object.assign(this, props);
  }
}

