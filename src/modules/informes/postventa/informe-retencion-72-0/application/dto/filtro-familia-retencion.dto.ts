import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';

export class FiltroFamiliaRetencionDto {
  @IsString()
  @MaxLength(200)
  segmento!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  familias!: string[];
}
