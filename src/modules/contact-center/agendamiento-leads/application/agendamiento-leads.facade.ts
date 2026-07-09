import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import {
  CC_AGENTES_ASIGNACION_LEADS,
  esAdminLeads,
} from '../../shared/domain/cc-permisos';
import {
  AsignarLeadsDto,
  GestionarLeadDto,
  ListarLeadsDto,
} from './dto/agendamiento-leads.dto';
import { AgendamientoLeadsRepository } from '../infra/repositories/agendamiento-leads.repository';

@Injectable()
export class AgendamientoLeadsFacade {
  constructor(private readonly repo: AgendamientoLeadsRepository) {}

  async listar(dto: ListarLeadsDto, userId: number, perfil: number) {
    if (esAdminLeads(perfil)) {
      return this.repo.getLeads(dto);
    }
    return this.repo.getLeadsAgente(userId);
  }

  getMotivos() {
    return this.repo.getMotivos();
  }

  getAgentesAsignacion() {
    return this.repo.getAgentesAsignacion([...CC_AGENTES_ASIGNACION_LEADS]);
  }

  asignar(dto: AsignarLeadsDto) {
    return this.repo.asignarAgente(dto.idleads, dto.agente);
  }

  gestionar(dto: GestionarLeadDto) {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== '') {
        data[key] = value;
      }
    }
    return this.repo.saveGestion(data);
  }

  async exportarExcel(): Promise<Buffer> {
    const rows = await this.repo.getAllLeadsExport();
    const wb = new Workbook();
    const ws = wb.addWorksheet('LEADS POSTVENTA');

    const cabeceras = [
      'Id Contactlead',
      'Documento',
      'Nombres',
      'Campaña',
      'Ciudad',
      'Teléfonos',
      'Email',
      'Id lead',
      'Fecha Hora Ingreso',
      'Id Agente',
      'Id Agencia',
      'Placa',
      'LEAD',
      'Agencia',
      'Agente',
      'Interesado',
      'Resultado',
      'Fecha Gestión',
    ];
    ws.addRow(cabeceras);

    for (const row of rows) {
      ws.addRow([
        row['idcontactlead'],
        row['documento'],
        row['nombres'],
        row['vhinteres'],
        row['ciudad'],
        row['telefonos'],
        row['email'],
        row['idlead'],
        row['fechahora_ing'],
        row['idagente'],
        row['idagencia'],
        row['placa'],
        row['lead'],
        row['agencia'],
        row['agente'],
        row['interesado'],
        row['motivo'] ?? row['idcita'],
        row['fecha_gestionado'],
      ]);
    }

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
