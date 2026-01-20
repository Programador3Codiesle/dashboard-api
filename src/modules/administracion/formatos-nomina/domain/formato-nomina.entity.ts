export class FormatoNominaEntity {
    id: number;
    nombre: string;
    descripcion: string;
    ruta_archivo: string;

    constructor(partial: Partial<FormatoNominaEntity>) {
        Object.assign(this, partial);
    }
}
