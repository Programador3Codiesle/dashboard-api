import { Injectable } from '@nestjs/common';
import { IFormatoNominaRepository } from '../../domain/formato-nomina.repository';
import { FormatoNominaEntity } from '../../domain/formato-nomina.entity';

@Injectable()
export class FormatoNominaPrismaRepository implements IFormatoNominaRepository {
    private readonly formatos = [
        { id: 1, nombre: 'Descuento de nomina codiesel', descripcion: 'Formato de descuento de nómina Codiesel', ruta_archivo: '/formatos/descuento-nomina-codiesel.pdf' },
        { id: 2, nombre: 'Descuento de nomina gente util', descripcion: 'Formato de descuento de nómina Gente Útil', ruta_archivo: '/formatos/descuento-nomina-gente-util.pdf' },
        { id: 3, nombre: 'Formato solicitud de vacaciones', descripcion: 'Formato de solicitud de vacaciones', ruta_archivo: '/formatos/solicitud-vacaciones.pdf' },
        { id: 4, nombre: 'Formato solicitud de vacaciones en dinero', descripcion: 'Formato de solicitud de vacaciones en dinero', ruta_archivo: '/formatos/solicitud-vacaciones-dinero.pdf' },
        { id: 5, nombre: 'Formato de entrega de solicitud de vacaciones vs fecha de pago', descripcion: 'Formato de entrega de solicitud de vacaciones vs fecha de pago', ruta_archivo: '/formatos/entrega-solicitud-vacaciones.pdf' }
    ];

    async obtenerFormatos(): Promise<FormatoNominaEntity[]> {
        return this.formatos.map(f => new FormatoNominaEntity(f));
    }

    async obtenerRutaArchivo(id: number): Promise<string | null> {
        const formato = this.formatos.find(f => f.id === id);
        return formato ? formato.ruta_archivo : null;
    }
}
