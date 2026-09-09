import { Injectable } from '@nestjs/common';
import { IFormatoNominaRepository } from '../../domain/formato-nomina.repository';
import { FormatoNominaEntity } from '../../domain/formato-nomina.entity';

/**
 * Catálogo estático: el legado (FormatosNomina.php + views/administracion/Formatos.php)
 * no consulta BD; lista 5 PDFs en public/administracion. No existe tabla formatos_nomina.
 */
const FORMATOS_NOMINA: FormatoNominaEntity[] = [
  new FormatoNominaEntity({
    id: 1,
    nombre: 'Descuento de nomina Codiesel',
    descripcion: 'Formato de descuento de nómina Codiesel',
    ruta_archivo:
      '/uploads/formatos/administracion/Descuento de nomina Codiesel.pdf',
  }),
  new FormatoNominaEntity({
    id: 2,
    nombre: 'Descuento de nomina Gente Util',
    descripcion: 'Formato de descuento de nómina Gente Útil',
    ruta_archivo:
      '/uploads/formatos/administracion/Descuento de nomina Gente Util.pdf',
  }),
  new FormatoNominaEntity({
    id: 3,
    nombre: 'Formato solicitud de vacaciones',
    descripcion: 'Formato de solicitud de vacaciones',
    ruta_archivo:
      '/uploads/formatos/administracion/Formato de Solicitud de Vacaciones.PDF',
  }),
  new FormatoNominaEntity({
    id: 4,
    nombre: 'Formato solicitud de vacaciones en dinero',
    descripcion: 'Formato de solicitud de vacaciones en dinero',
    ruta_archivo:
      '/uploads/formatos/administracion/Formato solicitud de vacaciones en dinero.pdf',
  }),
  new FormatoNominaEntity({
    id: 5,
    nombre: 'Fechas de entrega de solicitud de vacaciones vs fecha de pago',
    descripcion:
      'Formato de entrega de solicitud de vacaciones vs fecha de pago',
    ruta_archivo:
      '/uploads/formatos/administracion/Fechas de entrega de solicitud de vacaciones vs fecha de pago.pdf',
  }),
];

@Injectable()
export class FormatoNominaStaticRepository implements IFormatoNominaRepository {
  obtenerFormatos(): Promise<FormatoNominaEntity[]> {
    return Promise.resolve(FORMATOS_NOMINA);
  }

  obtenerRutaArchivo(id: number): Promise<string | null> {
    const formato = FORMATOS_NOMINA.find((item) => item.id === id);
    return Promise.resolve(formato?.ruta_archivo ?? null);
  }
}
