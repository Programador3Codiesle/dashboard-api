import { IsNotEmpty, IsString } from 'class-validator';

export class PresupuestoTipoOpQueryDto {
  @IsString()
  @IsNotEmpty()
  bodega!: string;
}
