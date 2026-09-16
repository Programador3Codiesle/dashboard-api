import { instanceToPlain } from 'class-transformer';
import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';
import { ControlVehiculoPresenter } from '../presenters/control-vehiculo.presenter';
import { ListarVehiculosResponseDto } from '../../application/dto/listar-vehiculos-response.dto';
import { RegistrarSalidaResponseDto } from '../../application/dto/registrar-salida-response.dto';
import { RegistrarLlegadaResponseDto } from '../../application/dto/registrar-llegada-response.dto';
import { ControlVehiculoListRow } from '../../domain/control-vehiculo.repository';
import { ControlVehiculoEntity } from '../../domain/control-vehiculo.entity';

function formatFechaYmdLocal(value: Date | null | undefined): string | null {
  if (!value || Number.isNaN(value.getTime())) return null;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class ControlVehiculoMapper {
  static toListResponseDto(
    entity: ControlVehiculoListRow,
  ): ListarVehiculosResponseDto {
    let modelo = 'No definido';
    if (entity.modelo === -1) {
      modelo = entity.otra_marca || entity.modelo_descripcion || 'No definido';
    } else if (entity.modelo && entity.modelo > 0) {
      modelo = entity.modelo_descripcion || 'No definido';
    }

    const presenter = new ControlVehiculoPresenter({
      id: entity.id != null ? Number(entity.id) : 0,
      fecha_salida:
        entity.fecha_salida_fmt ||
        formatFechaYmdLocal(entity.fecha_salida) ||
        '',
      hora_salida:
        entity.hora_salida_fmt || formatHoraHHmm(entity.fecha_salida) || '',
      km_salida: entity.km_salida != null ? Number(entity.km_salida) : 0,
      placa: entity.placa || '',
      tipo_vehiculo: entity.tipo_vehiculo || '',
      modelo,
      conductor: entity.conductor || '',
      pasajeros: entity.pasajeros || null,
      persona_autorizo: entity.persona_autorizo || null,
      fecha_llegada:
        entity.fecha_llegada_fmt ??
        formatFechaYmdLocal(entity.fecha_llegada ?? null),
      hora_llegada:
        entity.hora_llegada_fmt ??
        (entity.fecha_llegada ? formatHoraHHmm(entity.fecha_llegada) : null),
      km_llegada: entity.km_llegada != null ? Number(entity.km_llegada) : null,
      observacion: entity.observacion || null,
      placa_vh_remolcado: entity.placa_vh_remolcado || null,
      taller: entity.taller || null,
      porteria: entity.porteria || null,
      empresa_nombre: entity.empresa_nombre || null,
    });

    return instanceToPlain(presenter) as ListarVehiculosResponseDto;
  }

  static toRegistrarSalidaResponseDto(
    entity: ControlVehiculoEntity,
  ): RegistrarSalidaResponseDto['data'] {
    return {
      id: entity.id != null ? Number(entity.id) : 0,
      fecha_salida: formatFechaYmdLocal(entity.fecha_salida) || '',
      hora_salida: formatHoraHHmm(entity.fecha_salida) || '',
      km_salida: entity.km_salida != null ? Number(entity.km_salida) : 0,
      placa: entity.placa || '',
      tipo_vehiculo: entity.tipo_vehiculo || '',
      conductor: entity.conductor || '',
      pasajeros: entity.pasajeros || null,
      persona_autorizo: entity.persona_autorizo || null,
      porteria: entity.porteria || '',
      modelo: entity.modelo ?? null,
      taller: entity.taller || null,
      otra_marca: entity.otra_marca || null,
      placa_vh_remolcado: entity.placa_vh_remolcado || null,
      id_empresa: entity.id_empresa ?? null,
      empresa_nombre: (entity as ControlVehiculoListRow).empresa_nombre || null,
    };
  }

  static toRegistrarLlegadaResponseDto(
    entity: ControlVehiculoEntity,
  ): RegistrarLlegadaResponseDto['data'] {
    return {
      id: entity.id != null ? Number(entity.id) : 0,
      fecha_salida: formatFechaYmdLocal(entity.fecha_salida) || '',
      hora_salida: formatHoraHHmm(entity.fecha_salida) || '',
      km_salida: entity.km_salida != null ? Number(entity.km_salida) : 0,
      placa: entity.placa || '',
      tipo_vehiculo: entity.tipo_vehiculo || '',
      conductor: entity.conductor || '',
      pasajeros: entity.pasajeros || null,
      persona_autorizo: entity.persona_autorizo || null,
      fecha_llegada: formatFechaYmdLocal(entity.fecha_llegada ?? null),
      hora_llegada: entity.fecha_llegada
        ? formatHoraHHmm(entity.fecha_llegada)
        : null,
      km_llegada: entity.km_llegada != null ? Number(entity.km_llegada) : null,
      observacion: entity.observacion || null,
      porteria: entity.porteria || '',
      modelo: entity.modelo ?? null,
      taller: entity.taller || null,
      otra_marca: entity.otra_marca || null,
      placa_vh_remolcado: entity.placa_vh_remolcado || null,
      id_empresa: entity.id_empresa ?? null,
      empresa_nombre: (entity as ControlVehiculoListRow).empresa_nombre || null,
    };
  }
}
