import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NpsSedeDto {
  @IsString()
  sede!: string;

  @IsString()
  fecha!: string;

  @Type(() => Number)
  @IsNumber()
  calificacion!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cal06!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cal78!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cal910!: number;
}

export class NpsTecnicoDto {
  @IsString()
  sede!: string;

  @IsString()
  tecnico!: string;

  @IsString()
  fecha!: string;

  @Type(() => Number)
  @IsNumber()
  calificacion!: number;

  @IsString()
  placa!: string;

  @IsOptional()
  @IsString()
  tipificacion?: string;

  @IsIn(['0a6', '7a8', '9a10'])
  tipo_cal!: '0a6' | '7a8' | '9a10';
}

export class BuscarPlacaDto {
  @IsString()
  placa!: string;
}

export class BuscarNitDto {
  @IsString()
  nit_cc!: string;

  @IsString()
  placa!: string;
}

export class RegistrarUsuarioQrDto {
  @IsString()
  user_nit_comprador_up!: string;

  @IsString()
  user_nombres_up!: string;

  @IsString()
  user_celular_up!: string;

  @IsString()
  user_email_up!: string;

  @IsString()
  inputPlacaOrden!: string;

  @Type(() => Number)
  @IsNumber()
  opcion!: number;
}

export class ActualizarTerceroDto {
  @IsString()
  fieldNit!: string;

  @IsString()
  fieldMailUpdate!: string;

  @IsString()
  fieldPhoneUpdate!: string;
}

export class ResponderEncuestaQrDto {
  @IsString()
  placa!: string;

  @IsString()
  pregunta1!: string;

  @IsOptional()
  @IsString()
  pregunta4?: string;

  @IsOptional()
  @IsString()
  pregunta5?: string;

  @IsOptional()
  @IsString()
  pregunta7?: string;

  @IsString()
  bod!: string;

  @IsString()
  numero!: string;

  @IsString()
  fieldNit!: string;

  @IsString()
  propietario!: string;

  @IsOptional()
  @IsString()
  bodega?: string;
}

export class SinEncuestaDto {
  @IsString()
  numero!: string;

  @IsString()
  propietario!: string;

  @IsString()
  nit!: string;
}

export class ValidarPlacaQrQueryDto {
  @IsOptional()
  @IsString()
  placa?: string;
}

export class ResponderQrVentanillaDto {
  @IsString()
  bodega!: string;

  @IsString()
  placa!: string;

  /** POST name="2" en legado (pregunta1 en tabla). */
  @IsOptional()
  @IsString()
  pregunta2?: string;

  /** POST name="3" en legado (pregunta2 en tabla). */
  @IsOptional()
  @IsString()
  pregunta3?: string;

  /** POST name="4" en legado (pregunta3 en tabla). */
  @IsOptional()
  @IsString()
  pregunta4?: string;

  /** POST name="5" en legado (pregunta4 en tabla). */
  @IsOptional()
  @IsString()
  pregunta5?: string;

  /** POST name="7" en legado (pregunta5 en tabla). */
  @IsString()
  pregunta7!: string;
}
