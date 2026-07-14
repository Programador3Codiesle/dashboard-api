import { ChecklistTipo } from './checklist-definitions';

export interface IChecklistGuardarRepository {
  insertar(tipo: ChecklistTipo, data: Record<string, unknown>): Promise<number | null>;
  obtenerCorreosJefes(nitEmpleado: number): Promise<string[]>;
}

export const CHECKLIST_GUARDAR_REPOSITORY = Symbol('CHECKLIST_GUARDAR_REPOSITORY');
