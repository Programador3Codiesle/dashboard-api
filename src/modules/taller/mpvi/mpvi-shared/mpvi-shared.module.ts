import { Module } from '@nestjs/common';
import { EmailModule } from '../../../../core/infra/email/email.module';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { GenerarMpviPdfUseCase } from './application/generar-mpvi-pdf.usecase';
import { MpviEmailService } from './application/mpvi-email.service';
import { MpviLinkService } from './application/mpvi-link.service';
import { IMpviCotizacionRepository } from './domain/mpvi-cotizacion.repository';
import { MpviCotizacionPrismaRepository } from './infra/repositories/mpvi-cotizacion.prisma.repository';

@Module({
  imports: [EmailModule],
  providers: [
    GenerarMpviPdfUseCase,
    MpviEmailService,
    MpviLinkService,
    {
      provide: IMpviCotizacionRepository,
      useClass: MpviCotizacionPrismaRepository,
    },
    PrismaService,
  ],
  exports: [
    IMpviCotizacionRepository,
    GenerarMpviPdfUseCase,
    MpviEmailService,
    MpviLinkService,
  ],
})
export class MpviSharedModule {}
