import { Injectable } from '@nestjs/common';
import { IInformeSostenibilidadRepository } from '../../domain/informe-sostenibilidad.repository';

/**
 * Repositorio de informe de sostenibilidad.
 *
 * En este caso el informe es un PDF estático alojado en el servidor,
 * por lo que el repositorio únicamente expone la ruta relativa del recurso.
 * Si en el futuro la ruta se parametriza o se almacena en base de datos,
 * este repositorio será el punto único de cambio.
 */
@Injectable()
export class InformeSostenibilidadRepository implements IInformeSostenibilidadRepository {
    obtenerRutaArchivo(): string {
        // Mantener la misma ruta utilizada previamente en la fachada
        return '/informes/informe-sostenibilidad-2024.pdf';
    }
}

