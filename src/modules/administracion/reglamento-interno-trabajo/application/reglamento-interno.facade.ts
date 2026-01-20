import { Injectable } from '@nestjs/common';

@Injectable()
export class ReglamentoInternoFacade {
    obtenerRutaArchivo(): string {
        return '/reglamento/reglamento-interno-trabajo.pdf';
    }
}
