import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';
import { EmailService } from '../../../core/infra/email/email.service';
import {
  CRONOGRAMA_SEDES_BY_USER_ID,
  LISTADO_SEDES_BY_USER_ID,
  MAPA_AREA_LETRA,
  MAPA_BODEGA_LETRA,
  PERFIL_MTTO,
  PERFILES_ADMIN_MTTO,
} from '../domain/mantenimiento.constants';
import {
  MANTENIMIENTO_REPOSITORY,
  type DatosHidraulicos,
  type DatosTecnicos,
  type EquipoHojaVidaPayload,
  type MantenimientoRepository,
  type SessionUser,
} from '../domain/mantenimiento.repository';

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}
function todaySlash() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

const PERIODO_MESES: Record<string, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

/** Suma meses a una fecha YYYY-MM-DD preservando el día cuando sea posible */
function addMonthsYmd(ymd: string, months: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class MantenimientoFacade {
  constructor(
    @Inject(MANTENIMIENTO_REPOSITORY)
    private readonly repo: MantenimientoRepository,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  catalogos() {
    return Promise.all([
      this.repo.getFamilias(),
      this.repo.listarJefes(),
      this.repo.listarPersonalMto(),
      this.repo.listarBodegasMto(),
      this.repo.listarEquiposActivos(),
    ]).then(([familias, jefes, personal, bodegas, equipos]) => ({
      familias,
      jefes,
      personal,
      bodegas,
      equipos,
    }));
  }

  async listarEquipos(
    page: number,
    limit: number,
    filter?: string,
    bodega?: string,
    area?: string,
  ) {
    const p = Math.max(1, page || 1);
    const l = Math.min(100, Math.max(1, limit || 10));
    const offset = (p - 1) * l;
    const filters = { filter, bodega, area };
    const [data, total] = await Promise.all([
      this.repo.listarEquipos(filters, l, offset),
      this.repo.countEquipos(filters),
    ]);
    return { data, total, page: p, limit: l };
  }

  nombresFamilia(codigoF: string) {
    if (!codigoF) throw new BadRequestException('codigo requerido');
    return this.repo.getNombresFamilia(codigoF);
  }

  async crearEquipo(
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

    await this.persistHojaRelacionada(id, hoja);
    return { ok: true, codigo, id_equipo: id };
  }

  async actualizarEquipo(
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

  async getHojaVida(id: number) {
    const equipo = await this.repo.getEquipoById(id);
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    const [tecnicos, hidraulicos, elementos, recomendaciones, mtto_operativo, hist] =
      await Promise.all([
        this.repo.getDatosTecnicos(id),
        this.repo.getDatosHidraulicos(id),
        this.repo.getLista('elementos', id),
        this.repo.getLista('recomendaciones', id),
        this.repo.getLista('mtto_operativo', id),
        this.historial(equipo.codigo, id),
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

  async updateHojaVida(
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
    await this.persistHojaRelacionada(id, hoja);
    return { ok: true };
  }

  private async persistHojaRelacionada(
    idEquipo: number,
    hoja: EquipoHojaVidaPayload,
  ) {
    if (hoja.tiene_tecnicos && hoja.tecnicos) {
      await this.repo.upsertDatosTecnicos(idEquipo, hoja.tecnicos);
    } else {
      await this.repo.deleteDatosTecnicos(idEquipo);
    }
    if (hoja.tiene_hidraulicos && hoja.hidraulicos) {
      await this.repo.upsertDatosHidraulicos(idEquipo, hoja.hidraulicos);
    } else {
      await this.repo.deleteDatosHidraulicos(idEquipo);
    }
    await this.repo.replaceLista('elementos', idEquipo, hoja.elementos ?? []);
    await this.repo.replaceLista(
      'recomendaciones',
      idEquipo,
      hoja.recomendaciones ?? [],
    );
    await this.repo.replaceLista(
      'mtto_operativo',
      idEquipo,
      hoja.mtto_operativo ?? [],
    );
  }

  getEquipo(id: number) {
    return this.repo.getEquipoById(id);
  }

  async ordenPreventivoDesdeEquipo(
    user: SessionUser,
    body: {
      codigoEquipoMp: string;
      f_requerida: string;
      tiempo_estimado: number;
      descripcionMp: string;
    },
  ) {
    if (!body.codigoEquipoMp || !body.f_requerida || !body.descripcionMp) {
      throw new BadRequestException('Campos incompletos');
    }
    await this.repo.insertOrdenPreventiva({
      codigo: body.codigoEquipoMp,
      responsable: user.nit,
      fechaSolicitud: todayYmd(),
      fechaRequerida: body.f_requerida,
      descripcion: body.descripcionMp,
      tiempoEstimado: Number(body.tiempo_estimado) || 1,
    });
    return { ok: true };
  }

  async historial(codigo: string, idEquipo: number) {
    const [preventivo, correctivo] = await Promise.all([
      this.repo.historialPreventivo(codigo),
      this.repo.historialCorrectivo(idEquipo),
    ]);
    return { preventivo, correctivo };
  }

  async solicitarRetiro(
    user: SessionUser,
    equipoId: number,
    jefeNit: string,
    motivo: string,
    imagen: string,
  ) {
    const eq = await this.repo.getEquipoById(equipoId);
    if (!eq) throw new NotFoundException('Equipo no encontrado');

    const idRetiro = await this.repo.insertRetiro({
      equipoId,
      nitSolicita: user.nit,
      motivo,
      imagen,
      fecha: todayYmd(),
    });

    const base =
      this.config.get<string>('APP_URL') ?? 'http://localhost:4000';
    const accept = `${base}/mantenimiento/publico/autorizar-retiro?id=${idRetiro}&nit_user_resp=${encodeURIComponent(jefeNit)}`;
    const reject = `${base}/mantenimiento/publico/rechazar-retiro?id=${idRetiro}&nit_user_resp=${encodeURIComponent(jefeNit)}`;

    const correoJefe = await this.repo.getJefeCorreo(jefeNit);
    const to = [correoJefe, 'programador3@codiesel.com'].filter(
      Boolean,
    ) as string[];

    const html = `<p>Buen día</p>
      <p>La persona <strong>${user.nombres}</strong> ha solicitado el retiro del activo fijo
      <strong>${eq.codigo}</strong> (${eq.nombre_equipo}) por motivo:
      <strong>${motivo}</strong></p>
      <p><a href="${accept}">Aceptar</a> &nbsp; <a href="${reject}">Rechazar</a></p>`;

    if (to.length) {
      await this.email.sendEmail({
        to,
        subject: `Solicitud retiro de equipo: ${eq.nombre_equipo}`,
        html,
      });
    }
    return { ok: true, id: idRetiro };
  }

  async autorizarRetiroPublico(id: number, nitJefe: string) {
    const ret = await this.repo.getRetiroById(id);
    if (!ret) return { html: '<h3>Solicitud no encontrada</h3>' };
    if (ret.estado === 2) {
      return { html: '<h3>Esta solicitud ya ha sido autorizada</h3><h4>Puedes cerrar la pestaña</h4>' };
    }
    if (ret.estado === 1) {
      return { html: '<h3>Esta solicitud ya ha sido rechazada</h3><h4>Puedes cerrar la pestaña</h4>' };
    }
    await this.repo.autorizarRetiro(id, nitJefe, todayYmd());
    await this.repo.updateEstadoEquipo(ret.equipo_id, 'inactivo');
    return { html: '<h3>Solicitud autorizada correctamente</h3><h4>Puedes cerrar la pestaña del navegador</h4>' };
  }

  async rechazarRetiroPublico(id: number, nitJefe: string) {
    const ret = await this.repo.getRetiroById(id);
    if (!ret) return { html: '<h3>Solicitud no encontrada</h3>' };
    if (ret.estado === 1) {
      return { html: '<h3>Esta solicitud ya ha sido rechazada</h3><h4>Puedes cerrar la pestaña</h4>' };
    }
    if (ret.estado === 2) {
      return { html: '<h3>Esta solicitud ya ha sido autorizada</h3><h4>Puedes cerrar la pestaña</h4>' };
    }
    await this.repo.rechazarRetiro(id, nitJefe, todayYmd());
    return { html: '<h3>Solicitud rechazada correctamente</h3><h4>Puedes cerrar la pestaña del navegador</h4>' };
  }

  async listarCorrectivo(user: SessionUser) {
    if (user.perfil === PERFIL_MTTO) {
      const sedes = await this.repo.getSedesUsuario(user.nit);
      return this.repo.listarSolicitudesSedes(sedes);
    }
    if ((PERFILES_ADMIN_MTTO as readonly number[]).includes(user.perfil)) {
      return this.repo.listarSolicitudesAdmins();
    }
    return this.repo.listarSolicitudesJefe(user.nit);
  }

  puedeGestionarCorrectivo(user: SessionUser) {
    return user.perfil === PERFIL_MTTO || user.perfil === 26;
  }

  puedeSoloLecturaCorrectivo(user: SessionUser) {
    return user.perfil === 1 || user.perfil === 20;
  }

  async crearSolicitud(
    user: SessionUser,
    body: {
      equipoId?: string;
      sedeBodega: string;
      urgencia: string;
      solicitud: string;
    },
    imagen: string | null,
  ) {
    if (!body.solicitud || body.solicitud.length < 15) {
      throw new BadRequestException('La solicitud debe tener mínimo 15 caracteres');
    }
    if (!body.sedeBodega || !body.urgencia) {
      throw new BadRequestException('Sede y urgencia son requeridos');
    }
    const idEquipo =
      body.equipoId && body.equipoId !== 'N/A'
        ? Number(body.equipoId)
        : null;
    await this.repo.insertSolicitud({
      jefe: user.nit,
      fecha: todayYmd(),
      solicitud: body.solicitud,
      urgencia: Number(body.urgencia),
      sede: Number(body.sedeBodega),
      imagen,
      idEquipo: idEquipo && Number.isFinite(idEquipo) ? idEquipo : null,
    });
    return { ok: true };
  }

  async iniciarSolicitud(
    user: SessionUser,
    id: number,
    tiempoEstimado: number,
  ) {
    if (!this.puedeGestionarCorrectivo(user)) {
      throw new BadRequestException('No autorizado');
    }
    const sol = await this.repo.getSolicitudById(id);
    if (!sol) throw new NotFoundException('Solicitud no encontrada');
    await this.repo.iniciarSolicitud(
      id,
      user.nit,
      todaySlash(),
      tiempoEstimado || 1,
    );
    const idEquipo = num(sol.id_equipo);
    if (idEquipo > 0) {
      await this.repo.updateEstadoEquipo(idEquipo, 'Reparacion');
    }
    return { ok: true };
  }

  async finalizarSolicitud(
    user: SessionUser,
    id: number,
    respuesta: string,
    imagenResp: string | null,
  ) {
    if (!this.puedeGestionarCorrectivo(user)) {
      throw new BadRequestException('No autorizado');
    }
    const sol = await this.repo.getSolicitudById(id);
    if (!sol) throw new NotFoundException('Solicitud no encontrada');
    await this.repo.finalizarSolicitud(
      id,
      respuesta,
      todaySlash(),
      imagenResp,
    );
    const idEquipo = num(sol.id_equipo);
    if (idEquipo > 0) {
      await this.repo.updateEstadoEquipo(idEquipo, 'Activo');
    }
    return { ok: true };
  }

  getSolicitud(id: number) {
    return this.repo.getSolicitudById(id);
  }

  listarMensajes(id: number) {
    return this.repo.listarMensajes(id);
  }

  async agregarMensaje(
    user: SessionUser,
    id: number,
    mensaje: string,
  ) {
    if (!mensaje?.trim()) throw new BadRequestException('Mensaje vacío');
    await this.repo.insertMensaje({
      mensaje: mensaje.trim(),
      emisor: user.nit,
      idSolicitud: id,
      nombreEmisor: user.nombres,
    });
    return { ok: true };
  }

  async updateEquipoSolicitud(id: number, idEquipo: number) {
    await this.repo.updateEquipoSolicitud(id, idEquipo);
    return { ok: true };
  }

  async eventosPreventivo(user: SessionUser) {
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
          // Solo start: FullCalendar trata end exclusivo; start===end oculta el evento
          descripcion: str(r.descripcion),
          color,
          estado,
        };
      })
      .filter((e) => Boolean(e.start) && Boolean(e.id));
  }

  async listadoPreventivo(user: SessionUser) {
    const sedes = LISTADO_SEDES_BY_USER_ID[user.idUsuario];
    return this.repo.listadoPendientes(sedes);
  }

  getOrdenPreventivo(id: number) {
    return this.repo.ordenPreventivoById(id);
  }

  async iniciarOrden(user: SessionUser, id: number, asignado: string) {
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

  async finalizarOrden(
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
      str(orden.descripcion).trim() ||
      `Reasignación automática (${periodo})`;
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

  async eliminarOrden(id: number) {
    await this.repo.eliminarOrden(id);
    return { ok: true };
  }

  async updateFecha(
    user: SessionUser,
    id: number,
    date: string,
    dateOld: string,
  ) {
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

  async uploadCronograma(user: SessionUser, buffer: Buffer) {
    if (user.perfil !== PERFIL_MTTO && user.perfil !== 20) {
      throw new BadRequestException('No autorizado');
    }
    const wb = new ExcelJS.Workbook();
    // exceljs typings vs Node Buffer mismatch
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

  informePreventivo(estado?: string, bodega?: string) {
    return this.repo.informePreventivo(estado || undefined, bodega || undefined);
  }

  informeCorrectivo(estado?: string, bodega?: string) {
    return this.repo.informeCorrectivo(estado || undefined, bodega || undefined);
  }
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}
function num(v: unknown): number {
  return v == null || v === '' ? 0 : Number(v);
}
/** YYYY-MM-DD desde Date de SQL Server / string ISO (evita String(Date).slice). */
function toYmd(v: unknown): string {
  if (v == null || v === '') return '';
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(v);
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m?.[1] ?? '';
}

function parseJsonArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

function parseJsonObject<T extends Record<string, unknown>>(
  raw: unknown,
): T | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as T;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Parsea campos de hoja de vida enviados por multipart FormData. */
export function parseHojaVidaBody(
  body: Record<string, string>,
): EquipoHojaVidaPayload {
  const tieneTecnicos =
    body.tiene_tecnicos === '1' ||
    body.tiene_tecnicos === 'true' ||
    body.tiene_tecnicos === 'on';
  const tieneHidraulicos =
    body.tiene_hidraulicos === '1' ||
    body.tiene_hidraulicos === 'true' ||
    body.tiene_hidraulicos === 'on';
  const tecRaw = parseJsonObject<DatosTecnicos>(body.tecnicos);
  const hidRaw = parseJsonObject<DatosHidraulicos>(body.hidraulicos);
  return {
    alias: body.aliasEquipo || body.alias_equipo || body.alias || '',
    fabricante: body.fabricante || null,
    modelo: body.modelo || null,
    marca: body.marca || null,
    ubicacion: body.ubicacion || null,
    sector: body.sector || null,
    descripcion: body.descripcion || null,
    periodo_mtto_preventivo: body.periodo_mtto_preventivo || null,
    dist_nombre: body.dist_nombre || null,
    dist_direccion: body.dist_direccion || null,
    dist_telefono: body.dist_telefono || null,
    dist_ciudad: body.dist_ciudad || null,
    dist_departamento: body.dist_departamento || null,
    dist_redes_sociales: body.dist_redes_sociales || null,
    tiene_tecnicos: tieneTecnicos,
    tiene_hidraulicos: tieneHidraulicos,
    tecnicos: tieneTecnicos
      ? {
          alimentacion: tecRaw?.alimentacion ?? body.alimentacion ?? null,
          frecuencia_alimentacion:
            tecRaw?.frecuencia_alimentacion ??
            body.frecuencia_alimentacion ??
            null,
          anio_fabricacion:
            tecRaw?.anio_fabricacion ?? body.anio_fabricacion ?? null,
          numero_serie: tecRaw?.numero_serie ?? body.numero_serie ?? null,
          potencia_consumo:
            tecRaw?.potencia_consumo ?? body.potencia_consumo ?? null,
          peso: tecRaw?.peso ?? body.peso ?? null,
          revolucion: tecRaw?.revolucion ?? body.revolucion ?? null,
        }
      : null,
    hidraulicos: tieneHidraulicos
      ? {
          capacidad_litros:
            hidRaw?.capacidad_litros ?? body.capacidad_litros ?? null,
          capacidad_carga_tn:
            hidRaw?.capacidad_carga_tn ?? body.capacidad_carga_tn ?? null,
          tipo_aceite: hidRaw?.tipo_aceite ?? body.tipo_aceite ?? null,
          capacidad_maxima_carga:
            hidRaw?.capacidad_maxima_carga ??
            body.capacidad_maxima_carga ??
            null,
        }
      : null,
    elementos: parseJsonArray(body.elementos),
    recomendaciones: parseJsonArray(body.recomendaciones),
    mtto_operativo: parseJsonArray(body.mtto_operativo),
  };
}
