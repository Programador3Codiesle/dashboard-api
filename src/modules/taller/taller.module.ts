import { Module } from '@nestjs/common';
import { MpviAdminModule } from './mpvi/mpvi-admin/infra/mpvi-admin.module';
import { MpviSharedModule } from './mpvi/mpvi-shared/mpvi-shared.module';
import { MpviTecnicosModule } from './mpvi/mpvi-tecnicos/infra/mpvi-tecnicos.module';
import { MpviJefeTallerModule } from './mpvi/mpvi-jefe-taller/infra/mpvi-jefe-taller.module';
import { MpviContactModule } from './mpvi/mpvi-contact/infra/mpvi-contact.module';
import { MpviFirmaModule } from './mpvi/mpvi-firma/infra/mpvi-firma.module';
import { EntradaVehiculoModule } from './entrada-vehiculo/infra/entrada-vehiculo.module';
import { EstadoTallerModule } from './estado-taller/infra/estado-taller.module';
import { InformeOtAbiertasModule } from './informe-ot-abiertas/infra/informe-ot-abiertas.module';

@Module({
  imports: [
    MpviSharedModule,
    MpviAdminModule,
    MpviTecnicosModule,
    MpviJefeTallerModule,
    MpviContactModule,
    MpviFirmaModule,
    EntradaVehiculoModule,
    EstadoTallerModule,
    InformeOtAbiertasModule,
  ],
})
export class TallerModule {}
