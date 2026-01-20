import { Module } from '@nestjs/common';
import { AjusteValoresModule } from './ajuste-valores/infra/ajuste-valores.module';
import { ControlVehiculoModule } from './control-ingreso/infra/control-vehiculo.module';
import { GestionComprasModule } from './gestion-compras/infra/gestion-compras.module';
import { NuevoAusentismoModule } from './nuevo-ausentismo/infra/nuevo-ausentismo.module';
import { FormatosNominaModule } from './formatos-nomina/infra/formatos-nomina.module';
import { InformeSostenibilidadModule } from './informe-sostenibilidad/infra/informe-sostenibilidad.module';
import { ReglamentoInternoModule } from './reglamento-interno-trabajo/infra/reglamento-interno.module';
import { TallasDotacionModule } from './tallas-dotacion/infra/tallas-dotacion.module';
import { FormatoOrdenSalidaModule } from './formato-orden-salida/infra/orden-salida.module';
import { SolicitudTiempoSuplementarioModule } from './solicitud-tiempo-suplementario/infra/solicitud-tiempo-suplementario.module';
import { ListaHorasExtrasModule } from './lista-horas-extras/infra/lista-horas-extras.module';
import { InformeTiempoSuplementarioModule } from './informe-suplementario/infra/informe-suplementario.module';
import { InasistenciaModule } from './inasistencia/infra/inasistencia.module';
import { InformeAusentismoModule } from './informe-ausentismo/infra/informe-ausentismo.module';
import { ListaAusentismoModule } from './lista-ausentismo/infra/lista-ausentismo.module';
import { EvaluacionDesempenoModule } from './evaluacion-desempeno-jefe/infra/evaluacion-desempeno.module';
import { FormatoDesempenoModule } from './formato-desempeno-empleado/infra/formato-desempeno.module';

@Module({
    imports: [
        AjusteValoresModule,
        ControlVehiculoModule,
        GestionComprasModule,
        NuevoAusentismoModule,
        FormatosNominaModule,
        InformeSostenibilidadModule,
        ReglamentoInternoModule,
        TallasDotacionModule,
        FormatoOrdenSalidaModule,
        SolicitudTiempoSuplementarioModule,
        ListaHorasExtrasModule,
        InformeTiempoSuplementarioModule,
        InasistenciaModule,
        InformeAusentismoModule,
        ListaAusentismoModule,
        EvaluacionDesempenoModule,
        FormatoDesempenoModule,
    ],
    exports: []
})
export class AdministracionModule { }
