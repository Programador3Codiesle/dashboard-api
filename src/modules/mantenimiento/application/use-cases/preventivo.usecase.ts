import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  CRONOGRAMA_SEDES_BY_USER_ID,
  LISTADO_SEDES_BY_USER_ID,
  PERFIL_MTTO,
  PERIODO_MESES,
} from '../../domain/mantenimiento.constants';
import {
  IMantenimientoRepository,
  type SessionUser,
} from '../../domain/mantenimiento.repository';
import { addMonthsYmd, todayYmd } from '../utils/fechas';
import { num, str, toYmd } from '../utils/valores';

@Injectable()
export class EventosPreventivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser) {
    let sedes: string[] | undefined;
    if (user.perfil === PERFIL_MTTO) {
      sedes = CRONOGRAMA_SEDES_BY_USER_ID[user.idUsuario];
    }
    const rows = await this.repo.cronograma(sedes);
    return rows
      .map((r) => {
        const estado = num(r.estado);
        const color =
          estado === 1 ? '#0064FFDE' : estado === 2 ? '#ffc107' : '#28a745';
        const start = toYmd(r.fecha_requerida);
        return {
          id: num(r.id_mantenimientos),
          codigo: str(r.codigo),
          title: `${str(r.nombre_equipo)}-${str(r.bodega)}`,
          start,
          descripcion: str(r.descripcion),
          color,
          estado,
        };
      })
      .filter((e) => Boolean(e.start) && Boolean(e.id));
  }
}

@Injectable()
export class ListadoPreventivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(user: SessionUser) {
    const sedes = LISTADO_SEDES_BY_USER_ID[user.idUsuario];
    return this.repo.listadoPendientes(sedes);
  }
}

@Injectable()
export class GetOrdenPreventivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(id: number) {
    return this.repo.ordenPreventivoById(id);
  }
}

@Injectable()
export class IniciarOrdenUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser, id: number, asignado: string) {
    if (user.perfil !== PERFIL_MTTO) {
      throw new BadRequestException('Solo personal de mantenimiento');
    }
    if (!asignado || asignado === '*') {
      throw new BadRequestException('Debe seleccionar un asignado');
    }
    const orden = await this.repo.ordenPreventivoById(id);
    if (!orden) throw new NotFoundException('Orden no encontrada');
    await this.repo.iniciarOrden(id, asignado, todayYmd());
    const idEquipo = num(orden.id_equipo);
    if (idEquipo) await this.repo.updateEstadoEquipo(idEquipo, 'Reparacion');
    return { ok: true };
  }
}

@Injectable()
export class FinalizarOrdenUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    id: number,
    observaciones: string,
    piezas: string,
    reasignar = false,
    periodoBody?: string,
  ) {
    if (user.perfil !== PERFIL_MTTO) {
      throw new BadRequestException('Solo personal de mantenimiento');
    }
    if (!observaciones || !piezas) {
      throw new BadRequestException('Observación y piezas requeridos');
    }
    const orden = await this.repo.ordenPreventivoById(id);
    if (!orden) throw new NotFoundException('Orden no encontrada');
    const hoy = todayYmd();
    await this.repo.finalizarOrden(id, observaciones, piezas, hoy);
    const idEquipo = num(orden.id_equipo);
    if (idEquipo) await this.repo.updateEstadoEquipo(idEquipo, 'Activo');

    if (!reasignar) return { ok: true, reasignada: false };

    const periodoExistente = str(orden.periodo_mtto_preventivo).trim();
    const periodoNuevo = str(periodoBody).trim();
    const periodo = periodoExistente || periodoNuevo;
    const meses = PERIODO_MESES[periodo];
    if (!meses) {
      throw new BadRequestException(
        'Debe indicar un periodo válido para reasignar (mensual, trimestral, semestral o anual)',
      );
    }

    if (!periodoExistente && idEquipo) {
      await this.repo.updatePeriodoEquipo(idEquipo, periodo);
    }

    const fechaRequerida = addMonthsYmd(hoy, meses);
    const codigo = str(orden.codigo);
    const descripcion =
      str(orden.descripcion).trim() || `Reasignación automática (${periodo})`;
    const tiempoEstimado = num(orden.tiempo_estimado) || 1;

    await this.repo.insertOrdenPreventiva({
      codigo,
      responsable: user.nit,
      fechaSolicitud: hoy,
      fechaRequerida,
      descripcion,
      tiempoEstimado,
    });

    return { ok: true, reasignada: true, fecha_requerida: fechaRequerida };
  }
}

@Injectable()
export class EliminarOrdenUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(id: number) {
    await this.repo.eliminarOrden(id);
    return { ok: true };
  }
}

@Injectable()
export class UpdateFechaOrdenUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser, id: number, date: string, dateOld: string) {
    if (!date || date <= todayYmd()) {
      throw new BadRequestException('La fecha debe ser mayor a hoy');
    }
    await this.repo.updateFechaRequerida(id, date);
    await this.repo.insertHistFecha({
      idMtto: id,
      nitUser: user.nit,
      fechaSolicitud: todayYmd(),
      dateOld,
      dateNew: date,
    });
    return { ok: true };
  }
}

@Injectable()
export class UploadCronogramaUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(user: SessionUser, buffer: Buffer) {
    if (user.perfil !== PERFIL_MTTO && user.perfil !== 20) {
      throw new BadRequestException('No autorizado');
    }
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as never);
    const sheet = wb.worksheets[0];
    if (!sheet) throw new BadRequestException('Excel vacío');

    let ok = 0;
    let errDb = 0;
    const today = todayYmd();

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const codigo = str(row.getCell(1).value).trim();
      const fechaRaw = row.getCell(2).value;
      const descripcion = str(row.getCell(3).value).trim();
      const tiempo = num(row.getCell(4).value);
      if (!codigo && !descripcion) continue;

      let fecha = '';
      if (fechaRaw instanceof Date) {
        fecha = fechaRaw.toISOString().slice(0, 10);
      } else {
        fecha = str(fechaRaw).slice(0, 10);
      }

      if (!codigo || !fecha || !descripcion) {
        errDb++;
        continue;
      }
      const exists = await this.repo.equipoExiste(codigo);
      if (!exists) {
        errDb++;
        continue;
      }
      try {
        await this.repo.insertOrdenPreventiva({
          codigo,
          responsable: user.nit,
          fechaSolicitud: today,
          fechaRequerida: fecha,
          descripcion,
          tiempoEstimado: tiempo || 1,
        });
        ok++;
      } catch {
        errDb++;
      }
    }
    return { ok, err_db: errDb };
  }
}
