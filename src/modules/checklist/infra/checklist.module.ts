import { Module } from '@nestjs/common';
import { EmailService } from '../../../core/infra/email/email.service';
import { ChecklistGuardarFacade } from '../application/checklist-guardar.facade';
import { ChecklistNotificacionEmailService } from '../application/checklist-notificacion-email.service';
import { CHECKLIST_GUARDAR_REPOSITORY } from '../domain/checklist-guardar.repository';
import { ChecklistController } from './checklist.controller';
import { ChecklistGuardarPrismaRepository } from './repositories/checklist-guardar.prisma.repository';

@Module({
  controllers: [ChecklistController],
  providers: [
    ChecklistGuardarFacade,
    ChecklistNotificacionEmailService,
    EmailService,
    {
      provide: CHECKLIST_GUARDAR_REPOSITORY,
      useClass: ChecklistGuardarPrismaRepository,
    },
  ],
})
export class ChecklistModule {}
