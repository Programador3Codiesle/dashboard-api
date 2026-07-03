import { Injectable } from '@nestjs/common';
import { GenerarMpviPdfUseCase } from '../../../mpvi-shared/application/generar-mpvi-pdf.usecase';
import { MpviLinkService } from '../../../mpvi-shared/application/mpvi-link.service';

@Injectable()
export class ImprimirMpviClienteUseCase {
  constructor(
    private readonly generarPdf: GenerarMpviPdfUseCase,
    private readonly linkService: MpviLinkService,
  ) {}

  async execute(token: string) {
    const decoded = this.linkService.validarToken(token);
    return this.generarPdf.execute({
      idCotizacion: decoded.idCotizacion,
      quienVisualiza: 0,
      pdfGestionServicio: false,
    });
  }
}
