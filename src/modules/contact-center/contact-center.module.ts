import { Module } from '@nestjs/common';
import { InformeBaseDatosModule } from './informe-base-datos/infra/informe-base-datos.module';
import { DistribucionModule } from './distribucion/infra/distribucion.module';
import { DistribucionAgenteModule } from './distribucion-agente/infra/distribucion-agente.module';
import { AgendamientoLeadsModule } from './agendamiento-leads/infra/agendamiento-leads.module';
import { AuditoriaContactModule } from './auditoria-contact/infra/auditoria-contact.module';

@Module({
  imports: [
    InformeBaseDatosModule,
    DistribucionModule,
    DistribucionAgenteModule,
    AgendamientoLeadsModule,
    AuditoriaContactModule,
  ],
})
export class ContactCenterModule {}
