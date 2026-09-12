import { Module } from '@nestjs/common';
import { ComisionesAsesoresRepuestosModule } from './comisiones-asesores-repuestos/infra/comisiones-asesores-repuestos.module';
import { ComisionesJefesModule } from './comisiones-jefes/infra/comisiones-jefes.module';
import { ComisionesLaminaPinturaModule } from './comisiones-lamina-pintura/infra/comisiones-lamina-pintura.module';
import { ComisionesTecnicosModule } from './comisiones-tecnicos/infra/comisiones-tecnicos.module';
import { NominaDirectorFlotasModule } from './nomina-director-flotas/infra/nomina-director-flotas.module';
import { RelacionMargenMaterialesColoristaModule } from './relacion-margen-materiales-colorista/infra/relacion-margen-materiales-colorista.module';
import { NominaAccesoriosModule } from './nomina-accesorios/infra/nomina-accesorios.module';

@Module({
  imports: [
    ComisionesAsesoresRepuestosModule,
    ComisionesJefesModule,
    ComisionesLaminaPinturaModule,
    ComisionesTecnicosModule,
    NominaDirectorFlotasModule,
    RelacionMargenMaterialesColoristaModule,
    NominaAccesoriosModule,
  ],
  exports: [],
})
export class NominaModule {}
