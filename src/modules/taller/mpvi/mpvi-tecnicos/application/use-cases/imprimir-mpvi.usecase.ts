import { Injectable } from '@nestjs/common';
import { GenerarMpviPdfUseCase } from '../../../mpvi-shared/application/generar-mpvi-pdf.usecase';

@Injectable()
export class ImprimirMpviUseCase {
  constructor(private readonly generarPdf: GenerarMpviPdfUseCase) {}

  execute(idCotizacion: number, idEmpresa?: number) {
    return this.generarPdf.execute({
      idCotizacion,
      quienVisualiza: 1,
      pdfGestionServicio: false,
      idEmpresa,
    });
  }
}
