import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { IEncuestasRepository } from '../../domain/encuestas.repository';

function cellStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v).trim();
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    const maybe = v as { toString?: () => unknown };
    if (typeof maybe.toString === 'function') {
      const s = maybe.toString();
      if (typeof s === 'string' && s !== '' && s !== '[object Object]') {
        return s.trim();
      }
    }
  }
  return '';
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

@Injectable()
export class NpsTecnicosExcelUseCase {
  constructor(private readonly repo: IEncuestasRepository) {}

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
      const comentarios =
        key[14] != null && cellStr(key[14]) !== '' ? cellStr(key[14]) : null;

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
      // Paridad legado: insert_encuestas_nps_tec se llama aunque falle GM ($segunda no se mira).
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
}
