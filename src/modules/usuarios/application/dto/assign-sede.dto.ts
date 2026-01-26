import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSedeDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID de la sede' })
  idSede!: number;
}

export class responseSedeDto {
  @ApiProperty({ example: 1, description: 'ID de la sede' })
  id!: number;
  
  @ApiProperty({ example: 'Bucaramanga', description: 'Nombre de la sede' })
  nombre?: string;
}
