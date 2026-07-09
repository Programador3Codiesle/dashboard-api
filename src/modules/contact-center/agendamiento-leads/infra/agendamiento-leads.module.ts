import { Module } from '@nestjs/common';
import { AgendamientoLeadsFacade } from '../application/agendamiento-leads.facade';
import { AgendamientoLeadsController } from './agendamiento-leads.controller';
import { AgendamientoLeadsRepository } from './repositories/agendamiento-leads.repository';

@Module({
  controllers: [AgendamientoLeadsController],
  providers: [AgendamientoLeadsRepository, AgendamientoLeadsFacade],
})
export class AgendamientoLeadsModule {}
