import { Type } from 'class-transformer';
import { IsInt, IsString, Matches, Min } from 'class-validator';

export class GenerarInformeDto {
  @Type(() => Number)
  @IsInt()
  @Min(2015)
  yearOne!: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'monthOne debe tener formato YYYY-MM',
  })
  monthOne!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'monthTwo debe tener formato YYYY-MM',
  })
  monthTwo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2015)
  yearTwo!: number;
}
