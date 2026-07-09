import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class RepuestoLineaDto {
  @IsString()
  @IsNotEmpty()
  referencia!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CrearSolicitudEvDto {
  @IsInt()
  @Min(1)
  nOrden!: number;

  @IsString()
  @IsNotEmpty()
  obs!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RepuestoLineaDto)
  repuestos!: RepuestoLineaDto[];
}

export class BuscarOrdenEvDto {
  @IsInt()
  @Min(1)
  nOrden!: number;
}

export class ValidarRepuestoEvDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;
}
