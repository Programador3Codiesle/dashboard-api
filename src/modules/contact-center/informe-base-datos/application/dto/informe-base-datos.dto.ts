import { IsDateString, IsIn, IsOptional, ValidateIf } from 'class-validator';

export class ConsultarInformeBaseDatosDto {
  @IsIn(['1', '2', '3'])
  tipoInfDB!: '1' | '2' | '3';

  @ValidateIf((o: ConsultarInformeBaseDatosDto) => o.tipoInfDB !== '2')
  @IsDateString()
  @IsOptional()
  dateStart?: string;

  @IsDateString()
  dateEnd!: string;
}
