import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';


export class AssignHorarioDto {

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

  @ApiProperty({ example: '08:00' })
  hora_ent_fds: string;

  @ApiProperty({ example: '17:00' })
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

  @ApiProperty({ example: '08:00' })
  hora_ent_fds: string;

  @ApiProperty({ example: '17:00' })
  hora_sal_fds: string;


}
