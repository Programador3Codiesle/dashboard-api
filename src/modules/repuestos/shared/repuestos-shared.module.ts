import { Module } from '@nestjs/common';
import { EmailModule } from '../../../core/infra/email/email.module';
import { IEntradasVariasRepository } from './domain/entradas-varias.repository';
import { EntradasVariasPrismaRepository } from './infra/repositories/entradas-varias.prisma.repository';
import { EntradasVariasEmailService } from './application/entradas-varias-email.service';
import { GenerarFormatoEntregaPdfService } from './application/generar-formato-entrega-pdf.service';

@Module({
  imports: [EmailModule],
  providers: [
    {
      provide: IEntradasVariasRepository,
      useClass: EntradasVariasPrismaRepository,
    },
    EntradasVariasEmailService,
    GenerarFormatoEntregaPdfService,
  ],
  exports: [
    IEntradasVariasRepository,
    EntradasVariasEmailService,
    GenerarFormatoEntregaPdfService,
  ],
})
export class RepuestosSharedModule {}
