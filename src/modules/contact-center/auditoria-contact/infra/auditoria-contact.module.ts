import { Module } from '@nestjs/common';
import { EmailModule } from '../../../../core/infra/email/email.module';
import { AuditoriaContactEmailService } from '../application/auditoria-contact-email.service';
import { AuditoriaContactFacade } from '../application/auditoria-contact.facade';
import { AuditoriaContactController } from './auditoria-contact.controller';
import { AuditoriaContactRepository } from './repositories/auditoria-contact.repository';

@Module({
  imports: [EmailModule],
  controllers: [AuditoriaContactController],
  providers: [
    AuditoriaContactRepository,
    AuditoriaContactFacade,
    AuditoriaContactEmailService,
  ],
})
export class AuditoriaContactModule {}
