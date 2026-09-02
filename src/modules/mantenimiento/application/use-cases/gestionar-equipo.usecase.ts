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
} from '../../domain/mantenimiento.repository';

@Injectable()
export class CrearEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
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
      periodo_mtto_preventivo: hoja.periodo_mtto_preventivo,
      imagen: imagenFilename ?? hoja.imagen ?? null,
      dist_nombre: hoja.dist_nombre,
      dist_direccion: hoja.dist_direccion,
      dist_telefono: hoja.dist_telefono,
      dist_ciudad: hoja.dist_ciudad,
      dist_departamento: hoja.dist_departamento,
      dist_redes_sociales: hoja.dist_redes_sociales,
    });

    await persistHojaRelacionada(this.repo, id, hoja);
    return { ok: true, codigo, id_equipo: id };
  }
}

@Injectable()
export class ActualizarEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
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
      hist,
    ] = await Promise.all([
      this.repo.getDatosTecnicos(id),
      this.repo.getDatosHidraulicos(id),
      this.repo.getLista('elementos', id),
      this.repo.getLista('recomendaciones', id),
      this.repo.getLista('mtto_operativo', id),
      historialEquipo(this.repo, equipo.codigo, id),
    ]);
    return {
      equipo,
      tecnicos,
      hidraulicos,
      elementos,
      recomendaciones,
      mtto_operativo,
      historial: hist,
    };
  }
}

@Injectable()
export class UpdateHojaVidaUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
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
      periodo_mtto_preventivo: hoja.periodo_mtto_preventivo,
      imagen: imagenFilename ?? undefined,
      dist_nombre: hoja.dist_nombre,
      dist_direccion: hoja.dist_direccion,
      dist_telefono: hoja.dist_telefono,
      dist_ciudad: hoja.dist_ciudad,
      dist_departamento: hoja.dist_departamento,
      dist_redes_sociales: hoja.dist_redes_sociales,
    });
    await persistHojaRelacionada(this.repo, id, hoja);
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
}
