import { IsIn } from 'class-validator';
import { SEDE_KEYS, type SedeKey } from '../constants/sede-bodegas.constants';

export class SedeParamDto {
  @IsIn([...SEDE_KEYS])
  sede!: SedeKey;
}
