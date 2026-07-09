import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListarOrdenCompraDto {
  @IsString()
  @IsNotEmpty()
  fechaIni!: string;

  @IsString()
  @IsNotEmpty()
  fechaFin!: string;
}

export class OrdenCompraItemDto {
  @IsInt()
  numeroOc!: number;

  @IsString()
  @IsNotEmpty()
  codigo!: string;
}

export class AccionOrdenCompraDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrdenCompraItemDto)
  items!: OrdenCompraItemDto[];
}

export class GuardarPresupuestoOcDto {
  @IsString()
  @IsNotEmpty()
  fechaMes!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  presupuesto?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compras?: number;
}
