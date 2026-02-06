import AsesorConfig from './dashboard.entity';

/**
 * Constantes de negocio del dashboard: perfiles de usuario y centros de costo por sede.
 * Usadas por use-case (ruteo por perfil) y por services (administración).
 */

export const PERFIL_JEFE_TALLER = 33;
export const PERFIL_INFORME_TECNICOS = 24;
export const PERFIL_MTO = 46;
export const PERFIL_AGENTE_CC = 31;
/** Perfiles que ven dashboard de gerencia (reutilizan build admin). */
export const PERFIL_GERENCIA: number[] = [22, 23];
export const PERFIL_ASESOR_REP = 34;
export const PERFIL_COMPRAS = 28;
export const PERFIL_ADMIN = [1, 32] as const;

/** Centros de costo por sede (IDs para presupuesto/día). */
export const CENTROS_GIRON = '4,40,33,45,3';
export const CENTROS_ROSITA = '16,17';
export const CENTROS_BARRANCA = '13,70,11';
export const CENTROS_BOCONO = '29,80,31,46,28';
export const CENTROS_CHEVRO = '15';
export const CENTROS_SOLOCH = '60';
export const CENTROS_TODOS =
  '4,40,33,45,3,16,17,13,70,11,29,80,31,46,28,60,15';


export const ASESORES: AsesorConfig[] = [
  { nombre: 'QUIÑONEZ NAVAS DIEGO ALONSO', sede: 'MOSTRADOR' },
  { nombre: 'QUIÑONEZ NAVAS DIEGO ALONSO', sede: 'TALLER' },
  { nombre: 'CASTRO BLANCO LUIS EDUARDO', sede: 'SOLOCHEVROLET' },
  { nombre: 'OLAYA CALDERON JOSE ALLENDY', sede: 'MOSTRADOR-MAYOR' },
  { nombre: 'OLAYA CALDERON JOSE ALLENDY', sede: 'TALLER' },
  { nombre: 'CARRILLO ANGARITA FIDEL', sede: 'CUCUTA ASEGURADORA' },
  { nombre: 'RANGEL REYES CRISTIAN ORLANDO', sede: 'CUCUTA MOSTRADOR' },
  { nombre: 'LOPEZ JUAN MANUEL', sede: 'CUCUTA TALLER' },
  { nombre: 'CADENA RAMIREZ FERNANDO ANTONIO', sede: 'GIRON ASEGURADORA' },
  { nombre: 'ABRIL RAMIREZ LEONARDO', sede: 'GIRON TALLER' },
  { nombre: 'ARDILA SANCHEZ JOSUE', sede: 'GIRON MOSTRADOR' },
  { nombre: 'ARDILA SANCHEZ JOSUE', sede: 'GIRON ASEGURADORA-TALLER' },
  { nombre: 'MEJIA VARGAS OSCAR ALFONSO', sede: 'GIRON ASEGURADORA' },
  { nombre: 'OCHOA RUEDA JHON FREDDY', sede: 'CHEVROPARTES MAYOR' },
  { nombre: 'OCHOA RUEDA JHON FREDDY', sede: 'CHEVROPARTES MOSTRADOR' },
  { nombre: 'OCHOA RUEDA JHON FREDDY', sede: 'CHEVROPARTES ACEITE GRANEL' },
];