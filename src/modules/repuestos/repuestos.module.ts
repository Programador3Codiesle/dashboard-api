import { Module } from '@nestjs/common';
import { EntradasVariasModule } from './entradas-varias/infra/entradas-varias.module';
import { SolicitudesEvModule } from './solicitudes-ev/infra/solicitudes-ev.module';
import { InformeEvSvModule } from './informe-ev-sv/infra/informe-ev-sv.module';
import { InformeObsoletosModule } from './informe-obsoletos/infra/informe-obsoletos.module';
import { OrdenCompraModule } from './orden-compra/infra/orden-compra.module';

@Module({
  imports: [
    EntradasVariasModule,
    SolicitudesEvModule,
    InformeEvSvModule,
    InformeObsoletosModule,
    OrdenCompraModule,
  ],
})
export class RepuestosModule {}
