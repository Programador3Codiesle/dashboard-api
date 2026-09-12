import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListarPedidosRepuestosQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}
