import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearAuditoriaDto {
  @IsNumber()
  nitAgente!: number;
}

export class IdAuditoriaDto {
  @IsInt()
  id_auditoria!: number;
}

export class UpdateRespuestaDto {
  @IsInt()
  id_auditoria!: number;

  @IsInt()
  item!: number;

  @IsInt()
  opt!: number;
}

export class FinalizarAuditoriaDto {
  @IsInt()
  id_auditoria!: number;

  @IsString()
  @IsOptional()
  obsAuditor?: string;
}

export class ListarAuditoriasDto {
  @IsOptional()
  @IsNumber()
  nitAgente?: number;
}

export class CompromisoAgenteDto {
  @IsInt()
  id_auditoria!: number;

  @IsString()
  @MinLength(1)
  compromisos!: string;
}

export class InfDetalleDto {
  @IsString()
  AuditoriaMes!: string;

  @IsNumber()
  nitAgente!: number;
}

export class UpdateIndEstadoDto {
  @IsString()
  datosInd!: string;

  @IsInt()
  idIndicador!: number;

  @IsInt()
  estado!: number;
}

export class UpdateIndDto {
  @IsString()
  datosInd!: string;

  @IsString()
  newInd!: string;

  @IsNumber()
  newIndPuntos!: number;
}

export class EstadoIndicadorDto {
  @IsInt()
  id_indicador!: number;

  @IsInt()
  estado!: number;
}

export class IdIndicadorDto {
  @IsInt()
  id_indicador!: number;
}

export class AddItemDto {
  @IsInt()
  id_indicador!: number;

  @IsString()
  @MinLength(1)
  concepto!: string;
}

export class EstadoItemDto {
  @IsInt()
  id_item!: number;

  @IsInt()
  estado!: number;
}

export class IdItemDto {
  @IsInt()
  id_item!: number;
}

export class AddObsDto {
  @IsInt()
  id_item!: number;

  @IsString()
  @MinLength(1)
  obs!: string;
}

export class EstadoObsDto {
  @IsInt()
  id_obs!: number;

  @IsInt()
  estado!: number;
}

export class FormAuditoriaDto {
  @IsOptional()
  @IsString()
  opcion?: string;
}

export class UploadAuditoriaDto {
  @IsInt()
  id_auditoria!: number;
}
