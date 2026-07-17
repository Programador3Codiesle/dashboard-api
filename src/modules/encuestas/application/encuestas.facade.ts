import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import {
  ENCUESTAS_REPOSITORY,
  type EncuestasRepository,
} from '../domain/encuestas.repository';

function cellStr(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

function mapSedeGm(codigo: string): string {
  switch (codigo) {
    case '00000260492':
      return 'barranca';
    case '00000266043':
      return 'bocono';
    case '00000260493':
      return 'rosita';
    case '00000232420':
      return 'giron';
    default:
      return 'sin sede';
  }
}

function nowFechaHora(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
}

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Injectable()
export class EncuestasFacade {
  constructor(
    @Inject(ENCUESTAS_REPOSITORY)
    private readonly repo: EncuestasRepository,
  ) {}

  listarSatisfaccion() {
    return this.repo.listarSatisfaccion();
  }

  async detalleSatisfaccion(ot: string) {
    if (!ot?.trim()) {
      throw new BadRequestException('Número de orden requerido');
    }
    const orden = await this.repo.detalleOrdenSatisfaccion(ot.trim());
    const respuestas = await this.repo.respuestasSatisfaccion(ot.trim());
    return { orden, respuestas };
  }

  listarTecnicosNps() {
    return this.repo.listarTecnicosNps();
  }

  async insertNpsSede(body: {
    sede: string;
    fecha: string;
    calificacion: number;
    cal06: number;
    cal78: number;
    cal910: number;
  }) {
    const { sede, fecha, calificacion, cal06, cal78, cal910 } = body;
    if (!sede || !fecha || calificacion == null) {
      throw new BadRequestException('Campos requeridos incompletos');
    }
    const n = await this.repo.contarNpsSede(fecha, sede);
    const data = { sede, fecha, calificacion, cal06, cal78, cal910 };
    const ok =
      n > 0
        ? await this.repo.updateNpsSede(data)
        : await this.repo.insertNpsSede(data);
    if (!ok) throw new BadRequestException('Error al guardar NPS sede');
    return { ok: true, updated: n > 0 };
  }

  async insertNpsTecnico(body: {
    sede: string;
    tecnico: string;
    fecha: string;
    calificacion: number;
    placa: string;
    tipificacion: string;
    tipo_cal: '0a6' | '7a8' | '9a10';
  }) {
    const { sede, tecnico, fecha, calificacion, placa, tipificacion, tipo_cal } =
      body;
    if (!sede || !tecnico || !fecha || calificacion == null || !placa || !tipo_cal) {
      throw new BadRequestException('Campos requeridos incompletos');
    }
    let encu06 = 0;
    let encu78 = 0;
    let encu910 = 0;
    switch (tipo_cal) {
      case '0a6':
        encu06 = 1;
        break;
      case '7a8':
        encu78 = 1;
        break;
      case '9a10':
        encu910 = 1;
        break;
      default:
        throw new BadRequestException('tipo_cal inválido');
    }

    const n = await this.repo.contarNpsTecnico(fecha, tecnico);
    const data = {
      sede,
      tecnico,
      fecha,
      calificacion,
      placa,
      tipificacion: tipificacion || 'Ninguno',
      encu06,
      encu78,
      encu910,
    };

    if (n === 1) {
      const ok = await this.repo.updateNpsTecnico(data);
      if (!ok) throw new BadRequestException('Error al actualizar NPS técnico');
      return { ok: true, updated: true };
    }
    if (n === 0) {
      const ok = await this.repo.insertNpsTecnico(data);
      if (!ok) throw new BadRequestException('Error al insertar NPS técnico');
      return { ok: true, updated: false };
    }
    return { ok: true, skipped: true };
  }

  async uploadNpsTecnicos(buffer: Buffer) {
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new BadRequestException('Archivo Excel vacío');
    }

    let insertados = 0;
    let omitidos = 0;

    const rows: unknown[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      rows.push(values as unknown[]);
    });

    for (const key of rows) {
      const id_encuesta = cellStr(key[0]);
      // Skip header-like rows
      if (
        !id_encuesta ||
        id_encuesta.toLowerCase().includes('id') ||
        id_encuesta.toLowerCase() === 'id_encuesta'
      ) {
        continue;
      }

      const sede = mapSedeGm(cellStr(key[1]));
      const nom_cliente = cellStr(key[2]);
      const tecnicos = cellStr(key[3]).split('_');
      let nom_tecnico = '';
      let nit_tecnico = '';
      if (tecnicos.length > 1) {
        nom_tecnico = tecnicos[1] === 'ANONYMOUS' ? 'ANONYMOUS' : tecnicos[1];
        nit_tecnico = tecnicos[0] === '' ? '0' : tecnicos[0];
      }
      const VIN = cellStr(key[4]);
      const fecha_evento = cellStr(key[5]);
      const fecha_recibido_enc = cellStr(key[6]);
      const tipo_evento = cellStr(key[7]);
      const modelo_vh = cellStr(key[8]);
      const recomendacion_concesionario = cellStr(key[9]);
      const valor = cellStr(key[10]).split('-');
      const satisfaccion_concesionario = valor[0] ?? '';
      const trabajo = cellStr(key[11]).split('-');
      const satisfaccion_trabajo = trabajo[0] ?? '';
      const vh_reparado_ok = cellStr(key[12]);
      const recomendacion_marca = cellStr(key[13]);
      const comentarios = key[14] != null && cellStr(key[14]) !== '' ? cellStr(key[14]) : null;

      if (
        !id_encuesta ||
        !sede ||
        !nom_cliente ||
        !nom_tecnico ||
        !nit_tecnico ||
        !VIN ||
        !fecha_evento ||
        !fecha_recibido_enc ||
        !tipo_evento ||
        !modelo_vh ||
        !recomendacion_concesionario ||
        !satisfaccion_concesionario ||
        !satisfaccion_trabajo ||
        !recomendacion_marca ||
        !vh_reparado_ok
      ) {
        continue;
      }

      const existe = await this.repo.contarEncuestaGm(id_encuesta);
      if (existe !== 0) continue;

      const okGm = await this.repo.insertEncuestaGm({
        id_encuesta,
        sede,
        nom_cliente,
        nom_tecnico,
        nit_tecnico,
        VIN,
        fecha_evento,
        fecha_recibido_enc,
        tipo_evento,
        modelo_vh,
        recomendacion_concesionario,
        satisfaccion_concesionario,
        satisfaccion_trabajo,
        vh_reparado_ok,
        recomendacion_marca,
        comentarios,
      });
      await this.repo.insertNpsTec({
        nit_tecnico,
        nom_cliente,
        fecha_recibido_enc,
        recomendacion_concesionario,
        sede,
      });
      if (okGm) insertados += 1;
      else omitidos += 1;
    }

    return { insertados, omitidos };
  }

  async generarPlantillaNps(): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('NPS');
    sheet.addRow([
      'id_encuesta',
      'sede',
      'nom_cliente',
      'nit_tecnico_nombre',
      'VIN',
      'fecha_evento',
      'fecha_recibido_enc',
      'tipo_evento',
      'modelo_vh',
      'recomendacion_concesionario',
      'satisfaccion_concesionario',
      'satisfaccion_trabajo',
      'vh_reparado_ok',
      'recomendacion_marca',
      'comentarios',
    ]);
    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async listarPreguntasQr() {
    const all = await this.repo.listarPreguntasEncuesta();
    return all.filter((p) => p.id !== 2 && p.id !== 3);
  }

  async buscarPlaca(placa: string) {
    if (!placa?.trim()) throw new BadRequestException('Placa requerida');
    const data = await this.repo.buscarEncuestaByPlaca(placa.trim().toUpperCase());
    if (!data) return { response: 'error' as const };
    return { response: 'success' as const, ...data };
  }

  async buscarNit(nit: string, placa: string) {
    if (!nit || !placa) throw new BadRequestException('NIT y placa requeridos');
    const data = await this.repo.buscarContactoByNit(nit, placa.toUpperCase());
    if (!data) return { response: 'error' as const };
    return { response: 'success' as const, ...data };
  }

  async registrarUsuario(body: {
    nit: string;
    nombres: string;
    celular: string;
    email: string;
    placa: string;
    opcion: number;
  }) {
    const placa = body.placa.toUpperCase();
    if (Number(body.opcion) === 0) {
      const ok = await this.repo.insertContactoPlaca({
        placa,
        nit: body.nit,
        nombres: body.nombres,
        telefono: body.celular,
        mail: body.email,
        fecha_registro: todayYmd(),
      });
      return {
        response: ok ? ('success' as const) : ('error' as const),
        opcion: 'el registro',
      };
    }
    const ok = await this.repo.updateContactoPlaca(
      { nit: body.nit, placa },
      {
        nombres: body.nombres,
        telefono: body.celular,
        mail: body.email,
        fecha_actualizacion: nowFechaHora(),
      },
    );
    return {
      response: ok ? ('success' as const) : ('error' as const),
      opcion: 'la actualizacion',
    };
  }

  async actualizarTercero(body: {
    fieldNit: string;
    fieldMailUpdate: string;
    fieldPhoneUpdate: string;
  }) {
    const ok = await this.repo.updateTercero(body.fieldNit, {
      mail: body.fieldMailUpdate,
      celular: body.fieldPhoneUpdate,
    });
    return { response: ok ? ('success' as const) : ('error' as const) };
  }

  async responderEncuesta(body: {
    placa: string;
    pregunta1: string | number;
    pregunta4?: string | number | null;
    pregunta5?: string | number | null;
    pregunta7?: string | null;
    bod: string | number;
    numero: string | number;
    fieldNit: string | number;
    propietario: string | number;
    bodega?: string | number;
  }) {
    const placa = String(body.placa).toUpperCase();
    const okInsert = await this.repo.insertEncuestaSatisfaccionQr({
      placa,
      fecha: todayYmd(),
      pregunta1: body.pregunta1,
      pregunta2: 0,
      pregunta3: body.pregunta4 ?? null,
      pregunta4: body.pregunta5 ?? null,
      pregunta5: body.pregunta7 ?? null,
      fuente: 'QR',
      bod: body.bod,
      numero_orden: body.numero,
    });
    if (!okInsert) return { response: 'error' as const };

    const fecha_encuesta = nowFechaHora();
    const dataOrder = {
      encuesta: 1,
      propietario: body.propietario,
      fecha_encuesta,
      usuario_vh: body.fieldNit,
    };

    const affected = await this.repo.updateOrdenSalida(body.numero, dataOrder);
    if (affected <= 0) {
      const okI = await this.repo.insertOrdenSalida({
        numero: body.numero,
        placa_vh: placa,
        bodega_o: body.bodega ?? body.bod,
        ...dataOrder,
      });
      if (!okI) return { response: 'error' as const };
    }

    if (String(body.pregunta1) === '6' && String(body.propietario) === '1') {
      const okT = await this.repo.updateTercero(String(body.fieldNit), {
        concepto_7: 2,
      });
      return { response: okT ? ('success' as const) : ('error' as const) };
    }

    const okC = await this.repo.updateContactoPlaca(
      { nit: String(body.fieldNit), placa },
      { contactar: 0, fecha_actualizacion: nowFechaHora() },
    );
    return { response: okC ? ('success' as const) : ('error' as const) };
  }

  async sinEncuesta(body: {
    numero: string | number;
    propietario: string | number;
    nit: string | number;
  }) {
    const fecha_encuesta = nowFechaHora();
    const dataOrder = {
      encuesta: 0,
      propietario: body.propietario,
      fecha_encuesta,
      usuario_vh: body.nit,
    };
    const exists = await this.repo.selectOrdenSalida(body.numero);
    if (exists) {
      const ok = await this.repo.updateOrdenSalida(body.numero, dataOrder);
      return { response: ok > 0 ? ('success' as const) : ('error' as const) };
    }
    const ok = await this.repo.insertOrdenSalida({
      numero: body.numero,
      ...dataOrder,
    });
    return { response: ok ? ('success' as const) : ('error' as const) };
  }
}
