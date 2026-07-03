import { IsInt, IsObject, Min, Max } from 'class-validator';

export class GuardarElementoCatalogoDto {
  @IsInt()
  @Min(0)
  @Max(5)
  op: number;

  @IsObject()
  data: Record<string, unknown>;
}

export class SubirTablasAuxiliaresDto {
  @IsInt()
  @Min(0)
  @Max(2)
  tabla: number;
}
