import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import {
  PERFIL_JEFE_TALLER,
  PERFIL_INFORME_TECNICOS,
  PERFIL_MTO,
  PERFIL_AGENTE_CC,
  PERFIL_GERENCIA,
  PERFIL_ASESOR_REP,
  PERFIL_COMPRAS,
} from '../../domain/dashboard.constants';
import type { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { JefeTallerService } from '../../infra/services/jefe-taller.service';
import { TecnicoService } from '../../infra/services/tecnico.service';
import { AdministracionService } from '../../infra/services/administracion.service';
import { AgenteContactCenterService } from '../../infra/services/agente-contact-center.service';
import { GerenciaService } from '../../infra/services/gerencia.service';
import { ComprasService } from '../../infra/services/compras.service';
import { AsesorRepuestoService } from '../../infra/services/asesor-repuesto.service';
import { MantenimientoService } from '../../infra/services/mantenimiento.service';

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly commonRepo: IDashboardCommonRepository,
    private readonly jefeTallerService: JefeTallerService,
    private readonly tecnicoService: TecnicoService,
    private readonly administracionService: AdministracionService,
    private readonly agenteCCService: AgenteContactCenterService,
    private readonly gerenciaService: GerenciaService,
    private readonly comprasService: ComprasService,
    private readonly asesorRepService: AsesorRepuestoService,
    private readonly mantenimientoService: MantenimientoService,
  ) {}

  async execute(
    userId: string,
    nitUsuario: number,
    perfil: number | string,
    idsede?: number,
    mes?: number,
    ano?: number,
  ): Promise<DashboardResponseDto> {
    const perfilNum = typeof perfil === 'string' ? Number(perfil) : perfil;
    const fechaRow = await this.commonRepo.getFecha();
    const fechaActual =
      fechaRow?.fecha_actual ?? new Date().toISOString().slice(0, 10);
    const diaFestivo = await this.commonRepo.diasFestivos(fechaActual);

    if (perfilNum === PERFIL_JEFE_TALLER || perfilNum === 20) {
      return this.jefeTallerService.buildJefeTaller(
        nitUsuario,
        fechaActual,
        diaFestivo,
        userId,
      );
    }
    if (perfilNum === PERFIL_INFORME_TECNICOS) {
      return this.tecnicoService.buildTecnicos(
        nitUsuario,
        fechaActual,
        diaFestivo,
        userId,
        mes,
        ano,
      );
    }
    if (perfilNum === PERFIL_AGENTE_CC) {
      return this.agenteCCService.buildAgenteCC(
        nitUsuario,
        fechaActual,
        diaFestivo,
        userId,
      );
    }
    if (perfilNum === PERFIL_MTO) {
      return this.mantenimientoService.buildInformeMto(
        nitUsuario,
        fechaActual,
        diaFestivo,
        userId,
      );
    }
    if (perfilNum === PERFIL_COMPRAS) {
      return this.comprasService.buildCompras(
        fechaActual,
        diaFestivo,
        userId,
      );
    }
    if (perfilNum === PERFIL_ASESOR_REP) {
      return this.asesorRepService.buildAsesorRep(
        nitUsuario,
        fechaActual,
        diaFestivo,
        userId,
        idsede,
      );
    }
    if (PERFIL_GERENCIA.includes(perfilNum)) {
      return this.gerenciaService.buildGerencia(
        nitUsuario,
        fechaActual,
        diaFestivo,
        userId,
      );
    }
    return this.administracionService.buildAdmin(
      nitUsuario,
      fechaActual,
      diaFestivo,
      userId,
      perfilNum,
    );
  }
}
