import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateFormatoDesempenoDto {
    @IsNumber()
    @ApiProperty({ example: 123, description: 'NIT del empleado' })
    nit_empleado: number;

    @IsString()
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del empleado' })
    empleado: string;

    @IsString()
    @ApiProperty({ example: 'Sistemas', description: 'Área' })
    area: string;

    @IsString()
    @ApiProperty({ example: 'Desarrollador', description: 'Cargo' })
    cargo: string;

    @IsString()
    @ApiProperty({ example: 'Bucaramanga', description: 'Sede' })
    sede: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-15', description: 'Fecha de evaluación', required: false })
    fecha?: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 1, description: 'ID de la empresa', required: false })
    id_empresa?: number;

    // Auto-evaluación (30%)
    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Trabajo en equipo (Auto-evaluación)', required: false })
    trabajo_equipo_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Participa activamente (Auto-evaluación)', required: false })
    part_activa_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Propone iniciativas (Auto-evaluación)', required: false })
    prop_iniciativas_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Relaciones interpersonales (Auto-evaluación)', required: false })
    rel_interpersonales_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Comunicación efectiva (Auto-evaluación)', required: false })
    comunicacion_efect_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Discreción (Auto-evaluación)', required: false })
    discrecion_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Responsabilidad (Auto-evaluación)', required: false })
    responsabilidad_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Acatamiento (Auto-evaluación)', required: false })
    acatamiento_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Compromiso (Auto-evaluación)', required: false })
    compromiso_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Conocimiento procesos (Auto-evaluación)', required: false })
    conocimiento_pro_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Conocimiento metas (Auto-evaluación)', required: false })
    conocimiento_metas_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Adaptabilidad (Auto-evaluación)', required: false })
    adaptabilidad_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Control estrés (Auto-evaluación)', required: false })
    control_estres_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Solución conflictos - escucha (Auto-evaluación)', required: false })
    solu_conflictos_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Solución conflictos - estrategia (Auto-evaluación)', required: false })
    estrategia_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 4, description: 'Soluciones adecuadas (Auto-evaluación)', required: false })
    solu_adecuadas_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Identifica cliente (Auto-evaluación)', required: false })
    ident_cliente_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Servicio al cliente (Auto-evaluación)', required: false })
    serv_cliente_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Participa capacitación (Auto-evaluación)', required: false })
    part_capacitacion_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Informa peligros (Auto-evaluación)', required: false })
    info_peligros_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Informa accidentes (Auto-evaluación)', required: false })
    info_accidentes_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Informa salud (Auto-evaluación)', required: false })
    info_salud_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Usa EPP (Auto-evaluación)', required: false })
    uso_epp_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Llamados atención (Auto-evaluación)', required: false })
    llamados_aten_e?: number | null;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    })
    @IsNumber()
    @ApiProperty({ example: 5, description: 'Accidentes trabajo (Auto-evaluación)', required: false })
    accidentes_e?: number | null;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Capacitación en liderazgo', description: 'Necesidades de capacitación', required: false })
    capacidades_entrenamiento?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Mejorar puntualidad', description: 'Compromisos del trabajador', required: false })
    compromisos?: string;
}
