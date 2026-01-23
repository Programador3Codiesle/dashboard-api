import { instanceToPlain } from 'class-transformer';
import { ControlVehiculoPresenter } from '../presenters/control-vehiculo.presenter';
import { ListarVehiculosResponseDto } from '../../application/dto/listar-vehiculos-response.dto';
import { RegistrarSalidaResponseDto } from '../../application/dto/registrar-salida-response.dto';
import { RegistrarLlegadaResponseDto } from '../../application/dto/registrar-llegada-response.dto';
import { ControlVehiculoEntity } from '../../domain/control-vehiculo.entity';

export class ControlVehiculoMapper {
    /**
     * Mapea la entidad ControlVehiculoEntity al DTO de respuesta usando el presenter
     * @param entity - Entidad de dominio
     * @param modeloDescripcion - Descripción del modelo (opcional, viene del JOIN)
     * @param empresaNombre - Nombre de la empresa (opcional, viene del JOIN)
     * @returns DTO de respuesta para la API
     */
    static toListResponseDto(entity: ControlVehiculoEntity, modeloDescripcion?: string, empresaNombre?: string): ListarVehiculosResponseDto {
        // Formatear fecha de salida (YYYY-MM-DD)
        const fechaSalidaStr = entity.fecha_salida
            ? entity.fecha_salida.toISOString().split('T')[0]
            : null;

        // Formatear hora de salida (12 horas con AM/PM)
        const horaSalidaStr = entity.fecha_salida
            ? this.formatTime12Hours(entity.fecha_salida)
            : null;

        // Formatear fecha de llegada (YYYY-MM-DD)
        const fechaLlegadaStr = entity.fecha_llegada
            ? entity.fecha_llegada.toISOString().split('T')[0]
            : null;

        // Formatear hora de llegada (12 horas con AM/PM)
        const horaLlegadaStr = entity.fecha_llegada
            ? this.formatTime12Hours(entity.fecha_llegada)
            : null;

        // Determinar el modelo
        let modelo = 'No definido';
        if (entity.modelo === -1) {
            modelo = entity.otra_marca || 'No definido';
        } else if (entity.modelo && entity.modelo > 0) {
            modelo = modeloDescripcion || 'No definido';
        }

        const presenter = new ControlVehiculoPresenter({
            id: entity.id != null ? Number(entity.id) : 0,
            fecha_salida: fechaSalidaStr || '',
            hora_salida: horaSalidaStr || '',
            km_salida: entity.km_salida != null ? Number(entity.km_salida) : 0,
            placa: entity.placa || '',
            tipo_vehiculo: entity.tipo_vehiculo || '',
            modelo: modelo,
            conductor: entity.conductor || '',
            pasajeros: entity.pasajeros || null,
            persona_autorizo: entity.persona_autorizo || null,
            fecha_llegada: fechaLlegadaStr || null,
            hora_llegada: horaLlegadaStr || null,
            km_llegada: entity.km_llegada != null ? Number(entity.km_llegada) : null,
            observacion: entity.observacion || null,
            placa_vh_remolcado: entity.placa_vh_remolcado || null,
            taller: entity.taller && entity.taller !== 'N/A' ? entity.taller : null,
            empresa_nombre: empresaNombre || null,
        });

        // Convierte el presenter a objeto plano respetando los decoradores @Expose/@Exclude
        return instanceToPlain(presenter) as ListarVehiculosResponseDto;
    }

    /**
     * Mapea la entidad ControlVehiculoEntity al DTO de respuesta para registrarSalida
     * @param entity - Entidad de dominio
     * @returns DTO de respuesta para la API
     */
    static toRegistrarSalidaResponseDto(entity: ControlVehiculoEntity): RegistrarSalidaResponseDto['data'] {
        // Formatear fecha de salida (YYYY-MM-DD)
        const fechaSalidaStr = entity.fecha_salida
            ? entity.fecha_salida.toISOString().split('T')[0]
            : '';

        // Formatear hora de salida (12 horas con AM/PM)
        const horaSalidaStr = entity.fecha_salida
            ? this.formatTime12Hours(entity.fecha_salida)
            : '';

        return {
            id: entity.id != null ? Number(entity.id) : 0,
            fecha_salida: fechaSalidaStr,
            hora_salida: horaSalidaStr,
            km_salida: entity.km_salida != null ? Number(entity.km_salida) : 0,
            placa: entity.placa || '',
            tipo_vehiculo: entity.tipo_vehiculo || '',
            conductor: entity.conductor || '',
            pasajeros: entity.pasajeros || null,
            persona_autorizo: entity.persona_autorizo || null,
            porteria: entity.porteria || '',
            modelo: entity.modelo ?? null,
            taller: entity.taller && entity.taller !== 'N/A' ? entity.taller : null,
            otra_marca: entity.otra_marca || null,
            placa_vh_remolcado: entity.placa_vh_remolcado || null,
            id_empresa: entity.id_empresa ?? null,
            empresa_nombre: (entity as any).empresa_nombre || null,
        };
    }

    /**
     * Mapea la entidad ControlVehiculoEntity al DTO de respuesta para registrarLlegada
     * @param entity - Entidad de dominio
     * @returns DTO de respuesta para la API
     */
    static toRegistrarLlegadaResponseDto(entity: ControlVehiculoEntity): RegistrarLlegadaResponseDto['data'] {
        // Formatear fecha de salida (YYYY-MM-DD)
        const fechaSalidaStr = entity.fecha_salida
            ? entity.fecha_salida.toISOString().split('T')[0]
            : '';

        // Formatear hora de salida (12 horas con AM/PM)
        const horaSalidaStr = entity.fecha_salida
            ? this.formatTime12Hours(entity.fecha_salida)
            : '';

        // Formatear fecha de llegada (YYYY-MM-DD)
        const fechaLlegadaStr = entity.fecha_llegada
            ? entity.fecha_llegada.toISOString().split('T')[0]
            : null;

        // Formatear hora de llegada (12 horas con AM/PM)
        const horaLlegadaStr = entity.fecha_llegada
            ? this.formatTime12Hours(entity.fecha_llegada)
            : null;

        return {
            id: entity.id != null ? Number(entity.id) : 0,
            fecha_salida: fechaSalidaStr,
            hora_salida: horaSalidaStr,
            km_salida: entity.km_salida != null ? Number(entity.km_salida) : 0,
            placa: entity.placa || '',
            tipo_vehiculo: entity.tipo_vehiculo || '',
            conductor: entity.conductor || '',
            pasajeros: entity.pasajeros || null,
            persona_autorizo: entity.persona_autorizo || null,
            fecha_llegada: fechaLlegadaStr,
            hora_llegada: horaLlegadaStr,
            km_llegada: entity.km_llegada != null ? Number(entity.km_llegada) : null,
            observacion: entity.observacion || null,
            porteria: entity.porteria || '',
            modelo: entity.modelo ?? null,
            taller: entity.taller && entity.taller !== 'N/A' ? entity.taller : null,
            otra_marca: entity.otra_marca || null,
            placa_vh_remolcado: entity.placa_vh_remolcado || null,
            id_empresa: entity.id_empresa ?? null,
            empresa_nombre: (entity as any).empresa_nombre || null,
        };
    }

    /**
     * Formatea una fecha a formato de 12 horas con AM/PM
     * @param date - Fecha a formatear
     * @returns String en formato "hh:mm tt" (ej: "02:30 PM")
     */
    private static formatTime12Hours(date: Date): string {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        const minutesStr = minutes.toString().padStart(2, '0');
        return `${hours12.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
    }
}

