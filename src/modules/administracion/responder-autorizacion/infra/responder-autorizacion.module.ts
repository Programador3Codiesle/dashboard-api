import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../../../../core/infra/email/email.module';
import { GestionComprasModule } from '../../gestion-compras/infra/gestion-compras.module';
import { NuevoAusentismoModule } from '../../nuevo-ausentismo/infra/nuevo-ausentismo.module';
import { SolicitudTiempoSuplementarioModule } from '../../solicitud-tiempo-suplementario/infra/solicitud-tiempo-suplementario.module';
import { ResponderAutorizacionUseCase } from '../application/use-cases/responder-autorizacion.usecase';
import { ResponderAutorizacionController } from './responder-autorizacion.controller';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    GestionComprasModule,
    NuevoAusentismoModule,
    SolicitudTiempoSuplementarioModule,
  ],
  controllers: [ResponderAutorizacionController],
  providers: [ResponderAutorizacionUseCase],
})
export class ResponderAutorizacionModule {}
