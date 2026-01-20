import { EmpleadoPendiente } from '../interfaces/empleado-pendiente.interface';

export class EmpleadoPendienteEntity {
    /**
     * Mapea datos de la base de datos a una instancia de EmpleadoPendiente
     * @param data - Datos crudos de la base de datos
     * @returns Instancia de EmpleadoPendiente
     */
    static fromDatabase(data: any): EmpleadoPendiente {
        return {
            id_empleado: Number(data.id_empleado),
            nit: Number(data.nit),
            nombre: data.nombre || '',
            tiene_evaluacion: Boolean(data.tiene_evaluacion),
            id_evaluacion: data.id_evaluacion ? BigInt(data.id_evaluacion) : undefined
        };
    }

    /**
     * Mapea un array de datos de la base de datos a un array de EmpleadoPendiente
     * @param results - Array de datos crudos de la base de datos
     * @returns Array de instancias de EmpleadoPendiente
     */
    static fromDatabaseArray(results: any[]): EmpleadoPendiente[] {
        return results.map((r: any) => EmpleadoPendienteEntity.fromDatabase(r));
    }
}

