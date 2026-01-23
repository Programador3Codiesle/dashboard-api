import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';


export class AssignHorarioDto {
  @IsString()
  @ApiProperty({ example: 'Giron', description: 'Nombre de la sede' })
  sede: string;

  @IsString()
  @ApiProperty({ example: '08:00', description: 'Hora de entrada semana mañana' })
  hora_ent_sem_am: string;

  @IsString()
  @ApiProperty({ example: '12:00', description: 'Hora de salida semana mañana' })
  hora_sal_sem_am: string;

  @IsString()
  @ApiProperty({ example: '13:00', description: 'Hora de entrada semana tarde' })
  hora_ent_sem_pm: string;

  @IsString()
  @ApiProperty({ example: '17:00', description: 'Hora de salida semana tarde' })
  hora_sal_sem_pm: string;

  @IsString()
  @ApiProperty({ example: '18:00', description: 'Hora de entrada viernes mañana' })
  hora_ent_am_viernes: string;

  @IsString()
  @ApiProperty({ example: '08:00', description: 'Hora de salida viernes mañana' })
  hora_sal_am_viernes: string;

  @IsString()
  @ApiProperty({ example: '13:00', description: 'Hora de entrada viernes tarde' })
  hora_ent_pm_viernes: string;

  @IsString()
  @ApiProperty({ example: '17:00', description: 'Hora de salida viernes tarde' })
  hora_sal_pm_viernes: string;

  @IsString()
  @ApiProperty({ example: '13:00', description: 'Hora de entrada viernes tarde (hora_ent_viernes_pm)' })
  hora_ent_viernes_pm: string;

  @IsString()
  @ApiProperty({ example: '17:00', description: 'Hora de salida viernes (hora_sal_viernes)' })
  hora_sal_viernes: string;

  @IsString()
  @ApiProperty({ example: '08:00', description: 'Hora de entrada fin de semana' })
  hora_ent_fds: string;

  @IsString()
  @ApiProperty({ example: '17:00', description: 'Hora de salida fin de semana' })
  hora_sal_fds: string;
}

export class responseHorarioDto {

  @ApiProperty({ example: '10959442733' })
  nit_empleado: number;

  @ApiProperty({ example: 'Giron' })
  sede: string;

  @ApiProperty({ example: '08:00' })
  hora_ent_sem_am: string;

  @ApiProperty({ example: '12:00' })
  hora_sal_sem_am: string;

  @ApiProperty({ example: '13:00' })
  hora_ent_sem_pm: string;

  @ApiProperty({ example: '17:00' })
  hora_sal_sem_pm: string;

  @ApiProperty({ example: '18:00' })
  hora_ent_am_viernes: string;

  @ApiProperty({ example: '08:00' })
  hora_sal_am_viernes: string;

  @ApiProperty({ example: '13:00' })
  hora_ent_pm_viernes: string;

  @ApiProperty({ example: '17:00' })
  hora_sal_pm_viernes: string;

  @ApiProperty({ example: '13:00', description: 'Hora de entrada viernes tarde (hora_ent_viernes_pm)' })
  hora_ent_viernes_pm: string;

  @ApiProperty({ example: '17:00', description: 'Hora de salida viernes (hora_sal_viernes)' })
  hora_sal_viernes: string;

  @ApiProperty({ example: '08:00' })
  hora_ent_fds: string;

  @ApiProperty({ example: '17:00' })
  hora_sal_fds: string;
}
