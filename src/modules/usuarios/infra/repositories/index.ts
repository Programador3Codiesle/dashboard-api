/**
 * Exportación de todos los repositorios de Usuario
 * Organizados por responsabilidad (SRP - Single Responsibility Principle)
 * 
 * Estructura refactorizada:
 * - Core: CRUD básico, perfiles, estados
 * - Empresa: Gestión de relación usuario-empresa
 * - Jefe: Gestión de jefes y asignaciones
 * - Sede: Gestión de sedes y asignaciones
 * - Horario: Gestión de horarios laborales
 */

export { UsuarioCoreRepository } from './usuario-core.prisma.repository';
export { UsuarioEmpresaRepository } from './usuario-empresa.prisma.repository';
export { UsuarioJefeRepository } from './usuario-jefe.prisma.repository';
export { UsuarioSedeRepository } from './usuario-sede.prisma.repository';
export { UsuarioHorarioRepository } from './usuario-horario.prisma.repository';
