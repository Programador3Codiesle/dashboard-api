export class AjusteValoresEntity {
  sw?: number;
  fecha_reg?: Date;
  idUser_reg: number;
  tipo: string;
  numero: number;
  tipo_cruce?: string | null;
  numero_cruce?: number | null;
  retencion?: number | null;
  retencion_iva?: number | null;
  retencion_ica?: number | null;
  iva?: number | null;
  Retencion_estampilla2?: number | null;
  Retencion_estampilla1?: number | null;
  valor_aplicado?: number | null;
  valor_aplicado2?: number | null;
  valor_total?: number | null;
  forma_pago?: number | null;
  valor?: number | null;
  idDoc?: number | null;
  forma_pago2?: number | null;
  valor2?: number | null;
  idDoc2?: number | null;
  ano?: number | null;
  mes?: number | null;

  constructor(partial: Partial<AjusteValoresEntity>) {
    Object.assign(this, partial);
  }
}
