// assign-empresa.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignEmpresaDto {
  @ApiProperty({
    example: ['1', '2', '3'],
    description: 'Array de IDs de empresas a asignar',
    type: [String],
    required: true  // ← Marcar como requerido
  })
  @IsArray()
  @IsString({ each: true })
  empresas: string[];  // ← Quitar el ? para hacerlo requerido
}

// agregar-empresas-response.dto.ts
export class AgregarEmpresasResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Se agregaron 2 nuevas empresas' })
  message: string;

  @ApiProperty({ example: '1095944273' })
  cedula: string;

  @ApiProperty({ example: ['1', '2', '3', '4'] })
  empresasActuales: string[];

  @ApiProperty({ example: ['1', '2', '3', '4'] })
  empresasSolicitadas: string[];

  @ApiProperty({ example: ['3', '4'] })
  empresasAgregadas: string[];

  @ApiProperty({ example: ['1', '2'] })
  empresasQueYaTenía: string[];

  @ApiProperty({ example: 4 })
  totalEmpresas: number;
}