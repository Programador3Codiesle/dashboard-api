import { Injectable } from '@nestjs/common';

@Injectable()
export class InformeSostenibilidadFacade {
    obtenerRutaArchivo(): string {
        return '/informes/informe-sostenibilidad-2024.pdf';
    }
}
