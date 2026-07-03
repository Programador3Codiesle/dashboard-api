import { IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class ObtenerPanelQueryDto {
  @IsOptional()
  @IsString()
  placa?: string;
}

export class ObtenerCitasProgramadasQueryDto {
  @IsNotEmpty()
  @IsString()
  fecha!: string;
}

export class MarcarEntradaDto {
  @IsInt()
  idCita!: number;
}

export class VehiculoSinCitaDto {
  @IsString()
  @Length(6, 6)
  placa!: string;

  @IsString()
  @IsNotEmpty()
  cliente!: string;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsInt()
  bodega!: number;
}
