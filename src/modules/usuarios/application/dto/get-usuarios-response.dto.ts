// get-usuarios-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GetUsuariosResponseDto {
  @ApiProperty({ example: '1', description: 'ID del empleado' })
  id_empleado?: string;

  @ApiProperty({ example: '1', description: 'ID del usuario' })
  id?: string;

  // ✅ NUEVOS campos
  @ApiProperty({ example: 'Juan Pérez González', description: 'Nombres completos del tercero' })
  nombresCompletos?: string;

  @ApiProperty({ example: '123456789', description: 'NIT del usuario' })
  nit?: string;

  @ApiProperty({ example: 'Administrador Postventa', description: 'Nombre del perfil' })
  perfil?: string;

  @ApiProperty({ example: 'ACTIVO', description: 'Estado del usuario' })
  estado?: string;

  @ApiProperty({ example: 'Sede Norte', description: 'Sede asignada' })
  sede?: string;

  @ApiProperty({ example: 'Codiesel', description: 'Empresa asignada' })
  empresa?: string;

  @ApiProperty({ example: 'Codiesel, Dieselco, Mitsubishi', description: 'Empresa asignada' })
  empresaFormateada?: string;

  @ApiProperty({ example: '1,2,3', description: 'Empresa asignada' })
  empresasArray?: string[];

  @ApiProperty({ example: 'Codiesel, Dieselco, Mitsubishi', description: 'Empresa asignada' })
  empresasNombresArray?: string[];

  @ApiProperty({ example: 'Activo', description: 'Estado formateado para display' })
  estadoDisplay?: string;

  @ApiProperty({ example: '15 de enero de 2024, 10:30', description: 'Fecha formateada' })
  fechaCreacionFormateada?: string;

  @ApiProperty({ example: true, description: 'Indica si tiene sede asignada' })
  tieneSede?: boolean;

  @ApiProperty({ example: true, description: 'Indica si tiene empresa asignada' })
  tieneEmpresa?: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Fecha de creación' })
  createdAt?: Date;

  @ApiProperty({ example: '2024-01-20T14:45:00.000Z', description: 'Fecha de última modificación' })
  updatedAt?: Date;


}