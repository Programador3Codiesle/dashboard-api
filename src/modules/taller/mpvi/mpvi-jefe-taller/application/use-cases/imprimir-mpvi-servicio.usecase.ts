import { Injectable } from '@nestjs/common';
import { GenerarMpviPdfUseCase } from '../../../mpvi-shared/application/generar-mpvi-pdf.usecase';

/**
 * PDF jefe de taller / gestión servicio.
 * Legacy verCotizacion(op): op y pdfOrigen comparten el mismo valor.
 * 0 = Imprimir cotización (cliente, autorizado+ejecutado)
 * 1 = PDF técnico (vista interna, todas las líneas)
 * 2 = PDF BDC (vista interna, no autorizado / no ejecutado)
 */
@Injectable()
export class ImprimirMpviServicioUseCase {
  constructor(private readonly generarPdf: GenerarMpviPdfUseCase) {}

  execute(idCotizacion: number, tipo = 0, idEmpresa?: number) {
    const pdfTipo = Number.isFinite(tipo) ? Number(tipo) : 0;
    return this.generarPdf.execute({
      idCotizacion,
      quienVisualiza: pdfTipo,
      pdfGestion: pdfTipo,
      idEmpresa,
    });
  }
}
