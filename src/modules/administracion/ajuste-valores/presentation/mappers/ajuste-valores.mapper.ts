import { instanceToPlain } from 'class-transformer';
import { AjusteValoresEntity } from '../../domain/ajuste-valores.entity';
import { ResponseAjusteValoresDto } from '../../application/dto/response-ajuste-valores.dto';
import { AjusteValoresPresenter } from '../presenters/ajuste-valores.presenter';

export class AjusteValoresMapper {
  /**
   * Mapea la entidad AjusteValoresEntity al DTO de respuesta usando el presenter
   * Convierte: Entity → Presenter → Objeto plano (respetando @Expose/@Exclude)
   * @param entity - Entidad de dominio
   * @returns DTO de respuesta para la API
   */
  static toResponseDto(entity: AjusteValoresEntity): ResponseAjusteValoresDto {
    const presenter = new AjusteValoresPresenter({
      sw: entity.sw,
      tipo: entity.tipo,
      tipo_cruce: entity.tipo_cruce ?? null,
      numero_cruce: entity.numero_cruce ?? null,
      numero: entity.numero,
      retencion: entity.retencion ?? null,
      retencion_iva: entity.retencion_iva ?? null,
      retencion_ica: entity.retencion_ica ?? null,
      iva: entity.iva ?? null,
      Retencion_estampilla2: entity.Retencion_estampilla2 ?? null,
      Retencion_estampilla1: entity.Retencion_estampilla1 ?? null,
      valor_aplicado: entity.valor_aplicado ?? null,
      valor_total: entity.valor_total ?? null,
      forma_pago: entity.forma_pago ?? null,
      valor: entity.valor ?? null,
      ano: entity.ano ?? null,
      mes: entity.mes ?? null,
    });

    // Convierte el presenter a objeto plano respetando los decoradores @Expose/@Exclude
    return instanceToPlain(presenter) as ResponseAjusteValoresDto;
  }
}
