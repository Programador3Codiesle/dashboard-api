import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class ListarLeadsDto {
  @IsOptional()
  @IsIn(['0', '1', '3', ''])
  tipoLeads?: string;

  @IsOptional()
  @IsDateString()
  fecha_ini?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}

export class AsignarLeadsDto {
  @IsString()
  idleads!: string;

  @IsInt()
  agente!: number;
}

export class GestionarLeadDto {
  @IsInt()
  idcontactlead!: number;

  @IsOptional()
  @IsInt()
  interesado?: number;

  @IsOptional()
  @IsInt()
  motivo?: number;

  @IsOptional()
  @IsInt()
  idcita?: number;
}
