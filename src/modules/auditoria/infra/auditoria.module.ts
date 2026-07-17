import { Module } from '@nestjs/common';
import { AuditoriaFacade } from '../application/auditoria.facade';
import { AUDITORIA_REPOSITORY } from '../domain/auditoria.repository';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaPrismaRepository } from './repositories/auditoria.prisma.repository';

@Module({
  controllers: [AuditoriaController],
  providers: [
    AuditoriaFacade,
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaPrismaRepository,
    },
  ],
  exports: [AuditoriaFacade],
})
export class AuditoriaModule {}
