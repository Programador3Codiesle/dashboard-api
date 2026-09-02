import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CHECKLIST_COLUMNAS,
  isChecklistTipo,
  responsableFromData,
  ChecklistTipo,
} from '../domain/checklist-definitions';
import {
  CHECKLIST_GUARDAR_REPOSITORY,
  IChecklistGuardarRepository,
} from '../domain/checklist-guardar.repository';
import { GuardarChecklistDto } from './dto/guardar-checklist.dto';
import { ChecklistNotificacionEmailService } from './checklist-notificacion-email.service';

@Injectable()
export class ChecklistGuardarFacade {
  constructor(
    @Inject(CHECKLIST_GUARDAR_REPOSITORY)
    private readonly repo: IChecklistGuardarRepository,
    private readonly emailService: ChecklistNotificacionEmailService,
  ) {}

  async guardar(dto: GuardarChecklistDto, nitUsuario: number) {
    if (!isChecklistTipo(dto.check)) {
      throw new BadRequestException('Tipo de checklist inválido');
    }

    const tipo = dto.check;
    const data = this.normalizarData(tipo, dto.data);
    this.validarRequeridos(tipo, data);

    const id = await this.repo.insertar(tipo, data);
    if (id == null) {
      throw new BadRequestException('No se pudo guardar el checklist');
    }

    const responsable = responsableFromData(tipo, data);
    const correos = await this.repo.obtenerCorreosJefes(nitUsuario);
    void this.emailService.notificar(tipo, responsable, id, correos);

    return { ok: true, id };
  }

  private normalizarData(
    tipo: ChecklistTipo,
    raw: Record<string, unknown>,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(raw)) {
      if (value === '' || value === null || value === undefined) continue;
      data[key] = value;
    }

    if (tipo === 4 && data.observacion_func_elevacion != null) {
      data.observacion_funcionamiento_elevacion =
        data.observacion_func_elevacion;
      delete data.observacion_func_elevacion;
    }

    return data;
  }

  private validarRequeridos(
    tipo: ChecklistTipo,
    data: Record<string, unknown>,
  ) {
    const allowed = CHECKLIST_COLUMNAS[tipo];
    const keys = new Set(Object.keys(data));

    if (tipo === 0) {
      if (!data.area_trabajo || !data.proposito_trabajo || !data.fecha) {
        throw new BadRequestException(
          'Complete los campos obligatorios del formulario',
        );
      }
      return;
    }

    const generales = [
      'responsable',
      'equipo',
      'codigo',
      'sede',
      'fecha',
    ] as const;
    for (const g of generales) {
      if (allowed.includes(g) && !keys.has(g)) {
        throw new BadRequestException(`El campo ${g} es obligatorio`);
      }
    }

    if (tipo !== 5 && allowed.includes('area') && !keys.has('area')) {
      throw new BadRequestException('El campo area es obligatorio');
    }
  }
}
