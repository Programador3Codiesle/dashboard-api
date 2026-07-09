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
import { InformePosiblesRetornosModule } from './informe-posibles-retornos/infra/informe-posibles-retornos.module';
import { PygAsesoresRepuestosModule } from './pyg-asesores-repuestos/infra/pyg-asesores-repuestos.module';
import { PygTecnicosModule } from './pyg-tecnicos/infra/pyg-tecnicos.module';
import { PosiblesRetornosModule } from './posibles-retornos/infra/posibles-retornos.module';
import { PresupuestoModule } from './presupuesto/infra/presupuesto.module';

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
    InformePosiblesRetornosModule,
    PygAsesoresRepuestosModule,
    PygTecnicosModule,
    PosiblesRetornosModule,
    PresupuestoModule,
  ],
})
export class TallerModule {}
