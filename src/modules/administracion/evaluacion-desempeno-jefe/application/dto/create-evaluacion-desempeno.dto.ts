import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluacionDesempenoDto {
  @IsNumber()
  @ApiProperty({ example: 123, description: 'NIT del empleado a evaluar' })
  nit_empleado: number;

  // Evaluación Jefe (70%)
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Trabajo en equipo (Jefe)',
    required: false,
  })
  trabajo_equipo_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Participa activamente (Jefe)',
    required: false,
  })
  part_activa_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Propone iniciativas (Jefe)',
    required: false,
  })
  prop_iniciativas_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Relaciones interpersonales (Jefe)',
    required: false,
  })
  rel_interpersonales_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Comunicación efectiva (Jefe)',
    required: false,
  })
  comunicacion_efect_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Discreción (Jefe)',
    required: false,
  })
  discrecion_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Responsabilidad (Jefe)',
    required: false,
  })
  responsabilidad_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Acatamiento (Jefe)',
    required: false,
  })
  acatamiento_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Compromiso (Jefe)',
    required: false,
  })
  compromiso_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Conocimiento procesos (Jefe)',
    required: false,
  })
  conocimiento_pro_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Conocimiento metas (Jefe)',
    required: false,
  })
  conocimiento_metas_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Adaptabilidad (Jefe)',
    required: false,
  })
  adaptabilidad_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Control estrés (Jefe)',
    required: false,
  })
  control_estres_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Solución conflictos - escucha (Jefe)',
    required: false,
  })
  solu_conflictos_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Solución conflictos - estrategia (Jefe)',
    required: false,
  })
  estrategia_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'Soluciones adecuadas (Jefe)',
    required: false,
  })
  solu_adecuadas_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Identifica cliente (Jefe)',
    required: false,
  })
  ident_cliente_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Servicio al cliente (Jefe)',
    required: false,
  })
  serv_cliente_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Participa capacitación (Jefe)',
    required: false,
  })
  part_capacitacion_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Informa peligros (Jefe)',
    required: false,
  })
  info_peligros_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Informa accidentes (Jefe)',
    required: false,
  })
  info_accidentes_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Informa salud (Jefe)',
    required: false,
  })
  info_salud_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 5, description: 'Usa EPP (Jefe)', required: false })
  uso_epp_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Llamados atención (Jefe)',
    required: false,
  })
  llamados_aten_j?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Accidentes trabajo (Jefe)',
    required: false,
  })
  accidentes_j?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Capacitación en liderazgo',
    description: 'Necesidades de capacitación',
    required: false,
  })
  capacidades_entrenamiento?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Mejorar puntualidad',
    description: 'Compromisos del trabajador',
    required: false,
  })
  compromisos?: string;
}
