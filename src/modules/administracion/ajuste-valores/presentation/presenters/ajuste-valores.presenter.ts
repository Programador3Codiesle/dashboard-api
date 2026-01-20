import { Expose } from 'class-transformer';

export class AjusteValoresPresenter {
    @Expose()
    sw?: number;

    @Expose()
    tipo: string;

    @Expose()
    numero: number;

    @Expose()
    tipo_cruce?: string | null;

    @Expose()
    numero_cruce?: number | null;

    @Expose()
    retencion?: number | null;

    @Expose()
    retencion_iva?: number | null;

    @Expose()
    retencion_ica?: number | null;

    @Expose()
    iva?: number | null;

    @Expose()
    Retencion_estampilla2?: number | null;

    @Expose()
    Retencion_estampilla1?: number | null;

    @Expose()
    valor_aplicado?: number | null;

    @Expose()
    valor_total?: number | null;

    @Expose()
    forma_pago?: number | null;

    @Expose()
    valor?: number | null;

    @Expose()
    forma_pago2?: number | null;

    @Expose()
    ano?: number | null;

    @Expose()
    mes?: number | null;

    constructor(partial: Partial<AjusteValoresPresenter>) {
        Object.assign(this, partial);
    }
}

