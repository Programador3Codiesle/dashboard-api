import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IFormatoNominaRepository } from '../../domain/formato-nomina.repository';
import { FormatoNominaEntity } from '../../domain/formato-nomina.entity';

@Injectable()
export class FormatoNominaPrismaRepository implements IFormatoNominaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerFormatos(): Promise<FormatoNominaEntity[]> {
    try {
      // Query para obtener formatos de nómina desde la base de datos
      // Ajustar según la estructura real de la tabla en SQL Server
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id,
                    nombre,
                    descripcion,
                    ruta_archivo
                FROM formatos_nomina
                WHERE activo = 1
                ORDER BY nombre ASC
            `;

      if (!results || results.length === 0) {
        // Si no hay datos en BD, retornar formatos por defecto
        return this.getFormatosDefault();
      }

      return results.map(
        (r) =>
          new FormatoNominaEntity({
            id: Number(r.id),
            nombre: r.nombre,
            descripcion: r.descripcion || r.nombre,
            ruta_archivo: r.ruta_archivo,
          }),
      );
    } catch (error) {
      console.error('Error obteniendo formatos de nómina:', error);
      // En caso de error, retornar formatos por defecto
      return this.getFormatosDefault();
    }
  }

  async obtenerRutaArchivo(id: number): Promise<string | null> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT ruta_archivo
                FROM formatos_nomina
                WHERE id = ${id} AND activo = 1
            `;

      if (!results || results.length === 0) {
        // Buscar en formatos por defecto
        const formato = this.getFormatosDefault().find((f) => f.id === id);
        return formato ? formato.ruta_archivo : null;
      }

      return results[0].ruta_archivo;
    } catch (error) {
      console.error('Error obteniendo ruta de archivo:', error);
      // Buscar en formatos por defecto
      const formato = this.getFormatosDefault().find((f) => f.id === id);
      return formato ? formato.ruta_archivo : null;
    }
  }

  private getFormatosDefault(): FormatoNominaEntity[] {
    return [
      {
        id: 1,
        nombre: 'Descuento de nomina codiesel',
        descripcion: 'Formato de descuento de nómina Codiesel',
        ruta_archivo: '/formatos/descuento-nomina-codiesel.pdf',
      },
      {
        id: 2,
        nombre: 'Descuento de nomina gente util',
        descripcion: 'Formato de descuento de nómina Gente Útil',
        ruta_archivo: '/formatos/descuento-nomina-gente-util.pdf',
      },
      {
        id: 3,
        nombre: 'Formato solicitud de vacaciones',
        descripcion: 'Formato de solicitud de vacaciones',
        ruta_archivo: '/formatos/solicitud-vacaciones.pdf',
      },
      {
        id: 4,
        nombre: 'Formato solicitud de vacaciones en dinero',
        descripcion: 'Formato de solicitud de vacaciones en dinero',
        ruta_archivo: '/formatos/solicitud-vacaciones-dinero.pdf',
      },
      {
        id: 5,
        nombre:
          'Formato de entrega de solicitud de vacaciones vs fecha de pago',
        descripcion:
          'Formato de entrega de solicitud de vacaciones vs fecha de pago',
        ruta_archivo: '/formatos/entrega-solicitud-vacaciones.pdf',
      },
    ].map((f) => new FormatoNominaEntity(f));
  }
}
