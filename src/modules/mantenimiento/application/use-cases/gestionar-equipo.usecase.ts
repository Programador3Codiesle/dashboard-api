import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MAPA_AREA_LETRA,
  MAPA_BODEGA_LETRA,
} from '../../domain/mantenimiento.constants';
import {
  IMantenimientoRepository,
  type EquipoHojaVidaPayload,
  type PeriodoMttoInput,
  type SessionUser,
} from '../../domain/mantenimiento.repository';
import { todayYmd } from '../utils/fechas';
import { assertPuedeMutarEquipos } from '../utils/permiso-equipos';
import { assertPeriodosMtto } from '../utils/periodos-mtto';

@Injectable()
export class CrearEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    body: {
      aliasEquipo: string;
      nombreEquipo: string;
      nombreEquipo2: string;
      nombreBodega: string;
      nombrearea: string;
      codigoE: string;
    },
    hoja: EquipoHojaVidaPayload,
    imagenFilename?: string,
  ) {
    assertPuedeMutarEquipos(user);
    const nombre = await this.repo.getNombreEquipo(
      body.nombreEquipo,
      body.nombreEquipo2,
    );
    if (!nombre) throw new BadRequestException('Nombre de equipo inválido');
    if (!body.aliasEquipo?.trim()) {
      throw new BadRequestException('Alias requerido');
    }

    const ultimo = await this.repo.ultimoCodigoLike(body.codigoE);
    let codigo: string;
    if (ultimo) {
      const n = Number(ultimo);
      codigo = Number.isFinite(n) ? String(n + 1) : `${body.codigoE}01`;
    } else {
      codigo = `${body.codigoE}01`;
    }

    const bodega = MAPA_BODEGA_LETRA[body.nombreBodega] ?? 'No sirve';
    const area = MAPA_AREA_LETRA[body.nombrearea] ?? 'Chevy express';

    const id = await this.repo.insertEquipo({
      nombre,
      bodega,
      codigo,
      estado: 'Activo',
      area,
      cv: null,
      alias: body.aliasEquipo,
      fabricante: hoja.fabricante,
      modelo: hoja.modelo,
      marca: hoja.marca,
      ubicacion: hoja.ubicacion,
      sector: hoja.sector,
      descripcion: hoja.descripcion,
      periodo_mtto_preventivo: hoja.periodos_mtto[0]?.periodo ?? null,
      imagen: imagenFilename ?? hoja.imagen ?? null,
      dist_nombre: hoja.dist_nombre,
      dist_direccion: hoja.dist_direccion,
      dist_telefono: hoja.dist_telefono,
      dist_ciudad: hoja.dist_ciudad,
      dist_departamento: hoja.dist_departamento,
      dist_redes_sociales: hoja.dist_redes_sociales,
    });

    await persistHojaRelacionada(this.repo, id, hoja, {
      codigo,
      nit: user.nit,
    });
    return { ok: true, codigo, id_equipo: id };
  }
}

@Injectable()
export class ActualizarEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    id: number,
    body: {
      nombre_equipo: string;
      bodega: string;
      codigo: string;
      estado: string;
      area: string;
      alias_equipo: string;
    },
    cvFilename?: string,
  ) {
    assertPuedeMutarEquipos(user);
    const eq = await this.repo.getEquipoById(id);
    if (!eq) throw new NotFoundException('Equipo no encontrado');
    await this.repo.updateEquipo(id, {
      nombre: body.nombre_equipo,
      bodega: body.bodega,
      codigo: body.codigo,
      estado: body.estado,
      area: body.area,
      alias: body.alias_equipo,
      cv: cvFilename,
    });
    return { ok: true };
  }
}

@Injectable()
export class GetHojaVidaUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(id: number) {
    const equipo = await this.repo.getEquipoById(id);
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    const [
      tecnicos,
      hidraulicos,
      elementos,
      recomendaciones,
      mtto_operativo,
      periodos_mtto,
      hist,
    ] = await Promise.all([
      this.repo.getDatosTecnicos(id),
      this.repo.getDatosHidraulicos(id),
      this.repo.getLista('elementos', id),
      this.repo.getLista('recomendaciones', id),
      this.repo.getLista('mtto_operativo', id),
      this.repo.listPeriodosEquipo(id, true),
      historialEquipo(this.repo, equipo.codigo, id),
    ]);
    return {
      equipo,
      tecnicos,
      hidraulicos,
      elementos,
      recomendaciones,
      mtto_operativo,
      periodos_mtto,
      historial: hist,
    };
  }
}

@Injectable()
export class UpdateHojaVidaUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    user: SessionUser,
    id: number,
    body: {
      nombre_equipo?: string;
      bodega?: string;
      codigo?: string;
      estado?: string;
      area?: string;
      alias_equipo?: string;
    },
    hoja: EquipoHojaVidaPayload,
    imagenFilename?: string,
  ) {
    assertPuedeMutarEquipos(user);
    const eq = await this.repo.getEquipoById(id);
    if (!eq) throw new NotFoundException('Equipo no encontrado');
    await this.repo.updateEquipo(id, {
      nombre: body.nombre_equipo ?? eq.nombre_equipo,
      bodega: body.bodega ?? eq.bodega,
      codigo: body.codigo ?? eq.codigo,
      estado: body.estado ?? eq.estado,
      area: body.area ?? eq.area,
      alias: body.alias_equipo ?? hoja.alias ?? eq.alias_equipo ?? '',
      fabricante: hoja.fabricante,
      modelo: hoja.modelo,
      marca: hoja.marca,
      ubicacion: hoja.ubicacion,
      sector: hoja.sector,
      descripcion: hoja.descripcion,
      periodo_mtto_preventivo: hoja.periodos_mtto[0]?.periodo ?? null,
      imagen: imagenFilename ?? undefined,
      dist_nombre: hoja.dist_nombre,
      dist_direccion: hoja.dist_direccion,
      dist_telefono: hoja.dist_telefono,
      dist_ciudad: hoja.dist_ciudad,
      dist_departamento: hoja.dist_departamento,
      dist_redes_sociales: hoja.dist_redes_sociales,
    });
    await persistHojaRelacionada(this.repo, id, hoja, {
      codigo: body.codigo ?? eq.codigo,
      nit: user.nit,
    });
    return { ok: true };
  }
}

@Injectable()
export class HistorialEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(id: number) {
    const eq = await this.repo.getEquipoById(id);
    if (!eq) return { preventivo: [], correctivo: [] };
    return historialEquipo(this.repo, eq.codigo, id);
  }
}

export async function historialEquipo(
  repo: IMantenimientoRepository,
  codigo: string,
  idEquipo: number,
) {
  const [preventivo, correctivo] = await Promise.all([
    repo.historialPreventivo(codigo),
    repo.historialCorrectivo(idEquipo),
  ]);
  return { preventivo, correctivo };
}

export async function persistHojaRelacionada(
  repo: IMantenimientoRepository,
  idEquipo: number,
  hoja: EquipoHojaVidaPayload,
  ctx?: { codigo: string; nit: string },
) {
  if (hoja.tiene_tecnicos && hoja.tecnicos) {
    await repo.upsertDatosTecnicos(idEquipo, hoja.tecnicos);
  } else {
    await repo.deleteDatosTecnicos(idEquipo);
  }
  if (hoja.tiene_hidraulicos && hoja.hidraulicos) {
    await repo.upsertDatosHidraulicos(idEquipo, hoja.hidraulicos);
  } else {
    await repo.deleteDatosHidraulicos(idEquipo);
  }
  await repo.replaceLista('elementos', idEquipo, hoja.elementos ?? []);
  await repo.replaceLista(
    'recomendaciones',
    idEquipo,
    hoja.recomendaciones ?? [],
  );
  await repo.replaceLista(
    'mtto_operativo',
    idEquipo,
    hoja.mtto_operativo ?? [],
  );
  if (ctx) {
    await syncPeriodosMtto(
      repo,
      idEquipo,
      ctx.codigo,
      ctx.nit,
      hoja.periodos_mtto ?? [],
    );
  }
}

async function syncPeriodosMtto(
  repo: IMantenimientoRepository,
  idEquipo: number,
  codigo: string,
  nit: string,
  items: PeriodoMttoInput[],
) {
  assertPeriodosMtto(items);
  const existing = await repo.listPeriodosEquipo(idEquipo, false);
  const byId = new Map(existing.map((p) => [p.id, p]));
  const byPeriodo = new Map(existing.map((p) => [p.periodo, p]));
  const keepIds: number[] = [];
  const hoy = todayYmd();
  let orden = 1;

  for (const item of items) {
    const row =
      (item.id ? byId.get(item.id) : undefined) ?? byPeriodo.get(item.periodo);
    if (row) {
      const wasInactive = !row.activo;
      await repo.updatePeriodoMtto(row.id, {
        fechaInicio: item.fecha_inicio,
        descripcion: item.descripcion,
        activo: true,
        orden,
      });
      keepIds.push(row.id);
      if (wasInactive) {
        const pending = await repo.getPendingOtIdByPeriodo(row.id);
        if (!pending) {
          await insertOtPeriodo(repo, {
            codigo,
            nit,
            hoy,
            fecha: item.fecha_inicio,
            periodo: item.periodo,
            descripcion: item.descripcion,
            idPeriodo: row.id,
          });
        } else if (
          row.fecha_inicio !== item.fecha_inicio ||
          row.descripcion !== item.descripcion
        ) {
          await repo.updatePendingOtFechaByPeriodo(
            row.id,
            item.fecha_inicio,
            item.descripcion,
          );
        }
      } else if (
        row.fecha_inicio !== item.fecha_inicio ||
        row.descripcion !== item.descripcion
      ) {
        await repo.updatePendingOtFechaByPeriodo(
          row.id,
          item.fecha_inicio,
          item.descripcion,
        );
      }
    } else {
      const id = await repo.insertPeriodoMtto({
        idEquipo,
        periodo: item.periodo,
        fechaInicio: item.fecha_inicio,
        descripcion: item.descripcion,
        orden,
      });
      keepIds.push(id);
      await insertOtPeriodo(repo, {
        codigo,
        nit,
        hoy,
        fecha: item.fecha_inicio,
        periodo: item.periodo,
        descripcion: item.descripcion,
        idPeriodo: id,
      });
    }
    orden += 1;
  }

  await repo.desactivarPeriodosExcept(idEquipo, keepIds);
}

async function insertOtPeriodo(
  repo: IMantenimientoRepository,
  data: {
    codigo: string;
    nit: string;
    hoy: string;
    fecha: string;
    periodo: string;
    descripcion: string;
    idPeriodo: number;
  },
) {
  const texto =
    data.descripcion.trim() || `Mantenimiento preventivo ${data.periodo}`;
  await repo.insertOrdenPreventiva({
    codigo: data.codigo,
    responsable: data.nit,
    fechaSolicitud: data.hoy,
    fechaRequerida: data.fecha,
    descripcion: texto,
    tiempoEstimado: 1,
    idPeriodoMtto: data.idPeriodo,
  });
}
