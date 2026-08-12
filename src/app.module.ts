import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './core/infra/prisma/prisma.module';
import { TokenRespuestaModule } from './core/infra/token-respuesta/token-respuesta.module';
import { AuthModule } from './modules/auth/infra/auth.module';
import { UsuarioModule } from './modules/usuarios/infra/usuario.module';
import { TicketsModule } from './modules/tickets/infra/tickets.module';
import { AdministracionModule } from './modules/administracion/administracion.module';
import { InformePausasActivasModule } from './modules/administracion/informe-pausas-activas/infra/informe-pausas-activas.module';
import { InformeMttoPreventivoVhModule } from './modules/administracion/informe-mtto-preventivo-vh/infra/informe-mtto-preventivo.module';
import { InformeHorarioModule } from './modules/administracion/informe-horario/infra/informe-horario.module';
import { InformeEntradasSalidasModule } from './modules/administracion/informe-entradas-salidas/infra/informe-entradas-salidas.module';
import { InformeControlVehicularModule } from './modules/administracion/informe-control-vehicular/infra/informe-control-vehicular.module';
import { InformeIndicadorChecklistModule } from './modules/administracion/informe-indicador-checklist/infra/informe-indicador-checklist.module';
import { InformeControlComprasModule } from './modules/administracion/informe-control-compras/infra/informe-control-compras.module';
import { InformeChecklistCarroModule } from './modules/administracion/informe-checklist-carro/infra/informe-checklist-carro.module';
import { InformeChecklistMotoModule } from './modules/administracion/informe-checklist-moto/infra/informe-checklist-moto.module';
import { InformeChecklistPesvModule } from './modules/administracion/informe-checklist-pesv/infra/informe-checklist-pesv.module';
import { InformeChecklistsModule } from './modules/administracion/informe-checklists/infra/informe-checklists.module';
import { InformeOrdenesSalidaModule } from './modules/administracion/informe-ordenes-salida/infra/informe-ordenes-salida.module';
import { InformeTallasPersonalModule } from './modules/administracion/informe-tallas-personal/infra/informe-tallas-personal.module';
import { InformeDesempenoEmpleadoModule } from './modules/administracion/informe-desempeno-empleado/infra/informe-desempeno-empleado.module';
import { InformeTiempoGestionComprasModule } from './modules/administracion/informe-tiempo-gestion-compras/infra/informe-tiempo-gestion-compras.module';
import { InformeLlegadasTardeModule } from './modules/administracion/informe-llegadas-tarde/infra/informe-llegadas-tarde.module';
import { DashboardModule } from './modules/dashboard/infra/dashboard.module';
import { CotizadorModule } from './modules/cotizador/infra/cotizador.module';
import { InformeEncuestaSatisfaccionModule } from './modules/informes/postventa/informe-encuesta-satisfaccion/infra/informe-encuesta-satisfaccion.module';
import { InformePqrNpsModule } from './modules/informes/postventa/informe-pqr-nps/infra/informe-pqr-nps.module';
import { InformeSegundaEntregaModule } from './modules/informes/postventa/informe-segunda-entrega/infra/informe-segunda-entrega.module';
import { InformeMpcModule } from './modules/informes/postventa/informe-mpc/infra/informe-mpc.module';
import { InformePacNpsInternoDetalladoModule } from './modules/informes/postventa/informe-pac-nps-interno-detallado/infra/informe-pac-nps-interno-detallado.module';
import { InformePacModule } from './modules/informes/postventa/informe-pac/infra/informe-pac.module';
import { InformePanelNpsModule } from './modules/informes/postventa/informe-panel-nps/infra/informe-panel-nps.module';
import { InformeNpsTecnicosModule } from './modules/informes/postventa/informe-nps-tecnicos/infra/informe-nps-tecnicos.module';
import { InformeProductividadTecnicosModule } from './modules/informes/postventa/informe-productividad-tecnicos/infra/informe-productividad-tecnicos.module';
import { InformeNpsInternoModule } from './modules/informes/postventa/informe-nps-interno/infra/informe-nps-interno.module';
import { InformeRetencion720Module } from './modules/informes/postventa/informe-retencion-72-0/infra/informe-retencion-72-0.module';
import { InformeKpiModule } from './modules/informes/postventa/informe-kpi/infra/informe-kpi.module';
import { InformeTicketPromedioTecnicoModule } from './modules/informes/postventa/informe-ticket-promedio-tecnico/infra/informe-ticket-promedio-tecnico.module';
import { InformeEntradaVhModule } from './modules/informes/postventa/informe-entrada-vh/infra/informe-entrada-vh.module';
import { InformeVentas1a1Module } from './modules/informes/postventa/informe-ventas-1a1/infra/informe-ventas-1a1.module';
import { InformeTiempoEntrevistaConsultivaModule } from './modules/informes/postventa/informe-tiempo-entrevista-consultiva/infra/informe-tiempo-entrevista-consultiva.module';
import { InformeInventarioObsoletosModule } from './modules/informes/postventa/informe-inventario-obsoletos/infra/informe-inventario-obsoletos.module';
import { InformeEncuestasInternasModule } from './modules/informes/postventa/informe-encuestas-internas/infra/informe-encuestas-internas.module';
import { NominaModule } from './modules/nomina/nomina.module';
import { TallerModule } from './modules/taller/taller.module';
import { RepuestosModule } from './modules/repuestos/repuestos.module';
import { ContactCenterModule } from './modules/contact-center/contact-center.module';
import { ChecklistModule } from './modules/checklist/infra/checklist.module';
import { OrdenesTotModule } from './modules/ordenes-tot/infra/ordenes-tot.module';
import { IndicadoresModule } from './modules/indicadores/infra/indicadores.module';
import { EncuestasModule } from './modules/encuestas/infra/encuestas.module';
import { AuditoriaModule } from './modules/auditoria/infra/auditoria.module';
import { MantenimientoModule } from './modules/mantenimiento/infra/mantenimiento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Caché en memoria para endpoints de lectura frecuente
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 minutos por defecto
      max: 100, // máximo 100 items en caché
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120, // 120 req/min por IP (evita abuso sin bloquear uso normal)
      },
    ]),
    PrismaModule,
    TokenRespuestaModule,
    AuthModule,
    UsuarioModule,
    TicketsModule,
    AdministracionModule,
    InformePausasActivasModule,
    InformeMttoPreventivoVhModule,
    InformeHorarioModule,
    InformeEntradasSalidasModule,
    InformeControlVehicularModule,
    InformeIndicadorChecklistModule,
    InformeControlComprasModule,
    InformeChecklistCarroModule,
    InformeChecklistMotoModule,
    InformeChecklistPesvModule,
    InformeChecklistsModule,
    InformeOrdenesSalidaModule,
    InformeTallasPersonalModule,
    InformeDesempenoEmpleadoModule,
    InformeTiempoGestionComprasModule,
    InformeLlegadasTardeModule,
    DashboardModule,
    CotizadorModule,
    InformeEncuestaSatisfaccionModule,
    InformePqrNpsModule,
    InformeSegundaEntregaModule,
    InformeMpcModule,
    InformePacNpsInternoDetalladoModule,
    InformePacModule,
    InformePanelNpsModule,
    InformeNpsTecnicosModule,
    InformeProductividadTecnicosModule,
    InformeNpsInternoModule,
    InformeRetencion720Module,
    InformeKpiModule,
    InformeTicketPromedioTecnicoModule,
    InformeEntradaVhModule,
    InformeVentas1a1Module,
    InformeTiempoEntrevistaConsultivaModule,
    InformeInventarioObsoletosModule,
    InformeEncuestasInternasModule,
    NominaModule,
    TallerModule,
    RepuestosModule,
    ContactCenterModule,
    ChecklistModule,
    OrdenesTotModule,
    IndicadoresModule,
    EncuestasModule,
    AuditoriaModule,
    MantenimientoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
