import { Injectable } from '@nestjs/common';
import { IReglamentoInternoRepository } from '../../domain/reglamento-interno.repository';

/**
 * Repositorio de reglamento interno de trabajo.
 *
 * Encapsula la ruta del PDF estático del reglamento. Si en el futuro
 * la ruta se almacena en base de datos o en otra fuente, este será
 * el único punto de cambio.
 */
@Injectable()
export class ReglamentoInternoTrabajoRepository implements IReglamentoInternoRepository {
  obtenerRutaArchivo(): string {
    // Mantener la misma ruta utilizada previamente en la fachada
    return '/reglamento/reglamento-interno-trabajo.pdf';
  }
}
