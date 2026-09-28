export interface RepositoryResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
}

export interface FormaPagoLinea {
  id: number;
  forma_pago: number | null;
  valor: number | null;
}

export interface FormasPagoDocumento {
  ano: number | null;
  mes: number | null;
  lineas: FormaPagoLinea[];
}

/** Columnas de postv_ajuste_valores_cont_log. `iva` se agrega con ALTER en la base. */
export interface LogAjusteValores {
  idUser: number;
  tipo: string;
  numero: number;
  retencion?: number | null;
  retencion_iva?: number | null;
  retencion_ica?: number | null;
  iva?: number | null;
  Retencion_estampilla2?: number | null;
  Retencion_estampilla1?: number | null;
  valor_aplicado?: number | null;
  valor_total?: number | null;
  forma_pago?: number | null;
  valor?: number | null;
  idDoc?: number | null;
  forma_pago2?: number | null;
  valor2?: number | null;
  idDoc2?: number | null;
}
