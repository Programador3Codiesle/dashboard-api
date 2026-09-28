import { BadRequestException, Injectable } from '@nestjs/common';
import { IAjusteValoresRepository } from '../../domain/ajuste-valores.repository';
import { AjusteValoresEntity } from '../../domain/ajuste-valores.entity';
import {
  LineaFormaPagoDto,
  UpdateAjusteValoresDto,
} from '../dto/update-ajuste-valores.dto';

const MENSAJE_CERRADO = 'La fecha del documento ya se encuentra cerrada';

const CAMPOS_DOCUMENTO = [
  'retencion',
  'retencion_iva',
  'retencion_ica',
  'iva',
  'Retencion_estampilla2',
  'Retencion_estampilla1',
  'valor_aplicado',
  'valor_total',
] as const;

@Injectable()
export class ActualizarValoresUseCase {
  constructor(private readonly repo: IAjusteValoresRepository) {}

  async execute(
    idUser: number,
    numero: number,
    tipo: string,
    dto: UpdateAjusteValoresDto,
  ) {
    if (!Number.isFinite(idUser) || idUser <= 0) {
      throw new BadRequestException('No se pudo identificar el usuario');
    }

    if (dto.lineas?.length) {
      return this.actualizarPagos(idUser, numero, tipo, dto.lineas);
    }
    if (dto.valor_aplicado2 !== undefined) {
      return this.actualizarCruce(idUser, numero, tipo, dto.valor_aplicado2);
    }
    return this.actualizarDocumento(idUser, numero, tipo, dto);
  }

  private async actualizarDocumento(
    idUser: number,
    numero: number,
    tipo: string,
    dto: UpdateAjusteValoresDto,
  ) {
    const doc = await this.repo.obtenerValores(tipo, numero);
    if (!doc.status || !doc.data) {
      return { status: false, message: doc.message };
    }
    const cerrado = await this.rechazoSiCerrado(doc.data.ano, doc.data.mes);
    if (cerrado) return { status: false, message: cerrado };

    const campos: Partial<AjusteValoresEntity> = {};
    for (const campo of CAMPOS_DOCUMENTO) {
      const valor = dto[campo];
      if (valor !== undefined && valor !== null) {
        campos[campo] = valor;
      }
    }
    if (!Object.keys(campos).length) {
      return { status: false, message: 'No hay campos para actualizar' };
    }

    const actualizado = await this.repo.actualizarDocumento(
      tipo,
      numero,
      campos,
    );
    if (!actualizado.status) return actualizado;

    await this.repo.guardarLog({
      idUser,
      tipo,
      numero,
      retencion: campos.retencion,
      retencion_iva: campos.retencion_iva,
      retencion_ica: campos.retencion_ica,
      Retencion_estampilla2: campos.Retencion_estampilla2,
      Retencion_estampilla1: campos.Retencion_estampilla1,
      valor_aplicado: campos.valor_aplicado,
      valor_total: campos.valor_total,
      iva: campos.iva,
    });

    return this.repo.obtenerValores(tipo, numero);
  }

  private async actualizarPagos(
    idUser: number,
    numero: number,
    tipo: string,
    lineas: LineaFormaPagoDto[],
  ) {
    const pagos = await this.repo.listarFormasPago(tipo, numero);
    if (!pagos.status || !pagos.data) {
      return { status: false, message: pagos.message };
    }
    const cerrado = await this.rechazoSiCerrado(pagos.data.ano, pagos.data.mes);
    if (cerrado) return { status: false, message: cerrado };

    const idsValidos = new Set(pagos.data.lineas.map((linea) => linea.id));
    for (const linea of lineas) {
      if (!idsValidos.has(linea.id)) {
        return {
          status: false,
          message: 'La forma de pago no corresponde a este documento',
        };
      }
      const ok = await this.repo.actualizarFormaPagoPorId(
        tipo,
        numero,
        linea.id,
        linea.forma_pago,
        linea.valor,
      );
      if (!ok.status) return ok;
    }

    const primera = lineas[0];
    const segunda = lineas.length > 1 ? lineas[1] : undefined;
    const ultima = lineas.length > 1 ? lineas[lineas.length - 1] : undefined;
    await this.repo.guardarLog({
      idUser,
      tipo,
      numero,
      forma_pago: primera?.forma_pago ?? null,
      valor: primera?.valor ?? null,
      idDoc: primera?.id ?? null,
      forma_pago2: segunda?.forma_pago ?? null,
      valor2: segunda?.valor ?? null,
      idDoc2: ultima?.id ?? null,
    });

    return this.repo.listarFormasPago(tipo, numero);
  }

  private async actualizarCruce(
    idUser: number,
    numero: number,
    tipo: string,
    valor: number,
  ) {
    const doc = await this.repo.obtenerValores(tipo, numero);
    if (!doc.status || !doc.data) {
      return { status: false, message: doc.message };
    }
    const cerrado = await this.rechazoSiCerrado(doc.data.ano, doc.data.mes);
    if (cerrado) return { status: false, message: cerrado };

    const actualizado = await this.repo.actualizarValorCruce(
      tipo,
      numero,
      valor,
    );
    if (!actualizado.status) return actualizado;

    await this.repo.guardarLog({ idUser, tipo, numero, valor });
    return this.repo.obtenerValoresCruce(tipo, numero);
  }

  private async rechazoSiCerrado(
    ano: number | null | undefined,
    mes: number | null | undefined,
  ): Promise<string | null> {
    if (ano == null || mes == null) {
      return 'No se pudo validar la fecha del documento';
    }
    const validacion = await this.repo.validarDocumentosCerrados(ano, mes);
    if (!validacion.status) return validacion.message;
    if (validacion.data) return MENSAJE_CERRADO;
    return null;
  }
}
