import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  esAdminContactCenter,
  esAgenteContactCenter,
} from '../../shared/domain/cc-permisos';
import { AuditoriaContactEmailService } from './auditoria-contact-email.service';
import {
  AddItemDto,
  AddObsDto,
  CompromisoAgenteDto,
  CrearAuditoriaDto,
  EstadoIndicadorDto,
  EstadoItemDto,
  EstadoObsDto,
  FinalizarAuditoriaDto,
  FormAuditoriaDto,
  IdAuditoriaDto,
  IdIndicadorDto,
  IdItemDto,
  InfDetalleDto,
  ListarAuditoriasDto,
  UpdateIndDto,
  UpdateIndEstadoDto,
  UpdateRespuestaDto,
} from './dto/auditoria-contact.dto';
import {
  AuditoriaContactRepository,
  ItemRow,
} from '../infra/repositories/auditoria-contact.repository';

type FormItemJson = {
  idItem: number;
  concepto: string;
  puntosPorItem: number;
  respuestaEditable: boolean;
};

type FormIndicadorJson = {
  idIndicador: number;
  nombre: string;
  items: FormItemJson[];
};

@Injectable()
export class AuditoriaContactFacade {
  constructor(
    private readonly repo: AuditoriaContactRepository,
    private readonly emailService: AuditoriaContactEmailService,
  ) {}

  private assertAdmin(perfil: number): void {
    if (!esAdminContactCenter(perfil)) {
      throw new ForbiddenException('Acceso denegado');
    }
  }

  getAgentes(perfil: number) {
    this.assertAdmin(perfil);
    return this.repo.getAllUserAgente();
  }

  getCantPreguntas(perfil: number) {
    this.assertAdmin(perfil);
    return this.repo.getCantPreguntas();
  }

  async crearAuditoria(dto: CrearAuditoriaDto, nitEncargado: number) {
    const id = await this.repo.insertAuditoria(dto.nitAgente, nitEncargado);
    return { id_auditoria: id };
  }

  private groupItemsByIndicador(items: ItemRow[]): Map<number, ItemRow[]> {
    const map = new Map<number, ItemRow[]>();
    for (const item of items) {
      const list = map.get(item.id_indicador) ?? [];
      list.push(item);
      map.set(item.id_indicador, list);
    }
    return map;
  }

  async cargarFormulario(dto: FormAuditoriaDto, soloHabilitados: boolean) {
    const [indicadores, allItems] = await Promise.all([
      this.repo.getIndicadores(),
      this.repo.getAllItems(soloHabilitados),
    ]);
    const itemsByInd = this.groupItemsByIndicador(allItems);
    const bloques: FormIndicadorJson[] = [];
    let cantPreguntas = 0;
    const respuestaEditable = !dto.opcion;

    for (const ind of indicadores) {
      if (ind.estado === 1) continue;

      const items = itemsByInd.get(ind.id_indicador) ?? [];
      if (items.length === 0) continue;

      const numFilas = items.length;
      cantPreguntas += numFilas;

      bloques.push({
        idIndicador: ind.id_indicador,
        nombre: ind.nombres,
        items: items.map((item) => ({
          idItem: item.id_item,
          concepto: item.concepto,
          puntosPorItem: ind.puntuacion / numFilas,
          respuestaEditable,
        })),
      });
    }

    return { cantPreguntas, indicadores: bloques };
  }

  async updateRespuesta(dto: UpdateRespuestaDto) {
    const ok = await this.repo.updateRespuesta(
      dto.id_auditoria,
      dto.item,
      dto.opt,
    );
    return { status: ok ? 'OK' : 'ERROR' };
  }

  async finalizarAuditoria(dto: FinalizarAuditoriaDto) {
    const auditoria = await this.repo.getAuditoriaId(dto.id_auditoria);
    if (!auditoria) {
      throw new NotFoundException('Auditoría no encontrada');
    }

    const puntuacion = await this.calcularPuntuacion(auditoria);
    const ok = await this.repo.finalizarAuditoria(
      dto.id_auditoria,
      puntuacion,
      dto.obsAuditor ?? '',
    );

    return { id_auditoria: ok ? dto.id_auditoria : 0, puntuacion };
  }

  private async calcularPuntuacion(
    auditoria: Record<string, unknown>,
  ): Promise<number> {
    const [indicadores, allItems] = await Promise.all([
      this.repo.getIndicadores(),
      this.repo.getAllItems(true),
    ]);
    const itemsByInd = this.groupItemsByIndicador(allItems);
    let sumaPuntos = 0;

    for (const ind of indicadores) {
      if (ind.estado === 1) continue;

      const items = itemsByInd.get(ind.id_indicador) ?? [];
      const cantItem = items.length;
      if (cantItem === 0) continue;

      let sumaSi = 0;
      let sumaNA = 0;

      for (const item of items) {
        const campo = `item_${item.id_item}`;
        const resp = Number(auditoria[campo] ?? 0);
        if (resp === 1) sumaSi++;
        else if (resp === 3) sumaNA++;
      }

      if (sumaNA === cantItem) {
        sumaPuntos += ind.puntuacion;
      } else {
        const dividir = cantItem - sumaNA;
        const puntosXInd = dividir > 0 ? ind.puntuacion / dividir : 0;
        sumaPuntos += puntosXInd * sumaSi;
      }
    }

    return sumaPuntos;
  }

  async listarAdmin(dto: ListarAuditoriasDto, perfil: number) {
    this.assertAdmin(perfil);
    const rows = await this.repo.getAuditoriaAgentesAll(dto.nitAgente);
    return rows.map((row) => this.mapAuditoriaListItem(row, true));
  }

  async listarAgente(nitAgente: number) {
    const rows = await this.repo.getAuditoriaAgentesAll(nitAgente);
    return rows
      .filter((r) => r['fecha_finalizacion'] != null && r['fecha_finalizacion'] !== '')
      .map((row) => this.mapAuditoriaListItem(row, false));
  }

  private mapAuditoriaListItem(
    row: Record<string, unknown>,
    admin: boolean,
  ): Record<string, unknown> {
    const finalizada =
      row['fecha_finalizacion'] != null && row['fecha_finalizacion'] !== '';

    return {
      id_auditoria: row['id_auditoria'],
      nit_agente: row['nit_agente'],
      nombres: row['nombres'],
      puntuacion: row['puntuacion'],
      fecha_creacion: row['fecha_creacion'],
      fecha_finalizacion: row['fecha_finalizacion'],
      compromiso: row['compromiso'],
      estado: finalizada
        ? row['compromiso']
          ? 'finalizada'
          : 'pendiente_compromiso'
        : 'en_progreso',
      puedeEditar: admin && !finalizada,
      puedeVer: finalizada,
      puedeEnviarEmail: admin && finalizada,
    };
  }

  async verAuditoria(dto: IdAuditoriaDto, modo: 'admin' | 'agente' | 'editar') {
    const auditoria = await this.repo.getAuditoriaId(dto.id_auditoria);
    if (!auditoria) {
      throw new NotFoundException('Auditoría no encontrada');
    }

    const files = await this.repo.getAllFilesAuditoriaId(dto.id_auditoria);
    const indicadores = await this.buildDetalleIndicadores(
      auditoria,
      modo === 'editar',
      modo !== 'editar',
    );

    return {
      id_auditoria: auditoria['id_auditoria'],
      nit_agente: auditoria['nit_agente'],
      nombres: auditoria['nombres'],
      puntuacion: auditoria['puntuacion'],
      compromiso: auditoria['compromiso'],
      observaciones: auditoria['observaciones'],
      puedeAgregarCompromiso:
        modo === 'agente' && !auditoria['compromiso'],
      archivos: files.map((f) => ({
        url: `/uploads/auditoria-contact/${f['url_file']}`,
        nombre: f['url_file'],
      })),
      indicadores,
    };
  }

  private async buildDetalleIndicadores(
    auditoria: Record<string, unknown>,
    soloHabilitados: boolean,
    soloLectura: boolean,
  ) {
    const [indicadores, allItems] = await Promise.all([
      this.repo.getIndicadores(),
      this.repo.getAllItems(soloHabilitados),
    ]);
    const itemsByInd = this.groupItemsByIndicador(allItems);
    const bloques: Array<{
      idIndicador: number;
      nombre: string;
      items: Array<{
        idItem: number;
        concepto: string;
        respuesta: number | null;
        puntosPorItem: number;
        editable: boolean;
      }>;
    }> = [];

    const pendiente = auditoria['puntuacion'] == null || auditoria['puntuacion'] === '';

    for (const ind of indicadores) {
      if (soloHabilitados && ind.estado === 1) continue;

      const items = itemsByInd.get(ind.id_indicador) ?? [];
      const filtered = soloHabilitados
        ? items.filter((item) => item.estado !== 1)
        : items;

      if (filtered.length === 0) continue;

      const numFilas = filtered.length;
      bloques.push({
        idIndicador: ind.id_indicador,
        nombre: ind.nombres,
        items: filtered.map((item) => {
          const campo = `item_${item.id_item}`;
          const resp = auditoria[campo] as number | null;
          return {
            idItem: item.id_item,
            concepto: item.concepto,
            respuesta: resp != null ? Number(resp) : null,
            puntosPorItem: ind.puntuacion / numFilas,
            editable: !soloLectura && pendiente,
          };
        }),
      });
    }

    return bloques;
  }

  async registrarArchivos(
    idAuditoria: number,
    filenames: string[],
  ): Promise<{ cantSaveFile: string[]; cantNotSaveFile: string[] }> {
    const cantSaveFile: string[] = [];
    const cantNotSaveFile: string[] = [];

    for (const urlFile of filenames) {
      const ok = await this.repo.addFilesAuditoria(idAuditoria, urlFile);
      if (ok) cantSaveFile.push(urlFile);
      else cantNotSaveFile.push(urlFile);
    }

    return { cantSaveFile, cantNotSaveFile };
  }

  async cargarIndicadores() {
    const indicadores = await this.repo.getIndicadores();
    let sumaPuntos = 0;
    const rows = indicadores.map((ind) => {
      const habilitado = ind.estado === 2;
      if (habilitado) sumaPuntos += Number(ind.puntuacion);
      return {
        id_indicador: ind.id_indicador,
        nombres: ind.nombres,
        puntuacion: ind.puntuacion,
        estado: ind.estado,
        accionEstado: habilitado ? 'Inhabilitar' : 'Habilitar',
        nuevoEstado: habilitado ? 1 : 2,
      };
    });

    return { indicadores: rows, sumaPuntos, cantIndicadores: rows.length };
  }

  async cargarIndicadoresPuntos(idIndicador: number, estado: number) {
    const indicadores = await this.repo.getIndicadores();
    let sumaPuntos = 0;
    const rows = indicadores.map((ind) => {
      const esObjetivo = ind.id_indicador === idIndicador;
      let puntuacion = Number(ind.puntuacion);

      if (esObjetivo && estado === 1) {
        puntuacion = 0;
      } else if (esObjetivo && estado === 2) {
        puntuacion = Number(ind.puntuacion);
        sumaPuntos += puntuacion;
      } else {
        sumaPuntos += puntuacion;
      }

      return {
        id_indicador: ind.id_indicador,
        nombres: ind.nombres,
        puntuacion,
        editable: !(esObjetivo && estado === 1),
      };
    });

    return {
      indicadores: rows,
      sumaPuntos,
      cantIndicadores: rows.length,
      estadoIndCambiar: estado,
      idIndicadorCambiar: idIndicador,
    };
  }

  private parseDatosInd(datosInd: string): Array<[number, string, number]> {
    const parts = datosInd.split(',').map((p) => p.trim());
    const result: Array<[number, string, number]> = [];
    for (let i = 0; i < parts.length; i += 3) {
      result.push([
        Number(parts[i]),
        parts[i + 1] ?? '',
        Number(parts[i + 2] ?? 0),
      ]);
    }
    return result;
  }

  async updateIndEstado(dto: UpdateIndEstadoDto, perfil: number) {
    this.assertAdmin(perfil);
    for (const [id, , puntos] of this.parseDatosInd(dto.datosInd)) {
      await this.repo.updateIndicadores(id, puntos);
    }
    const ok = await this.repo.estadoIndicador(dto.idIndicador, dto.estado);
    return { result: ok ? 1 : 0 };
  }

  async updateInd(dto: UpdateIndDto, perfil: number) {
    this.assertAdmin(perfil);
    for (const [id, , puntos] of this.parseDatosInd(dto.datosInd)) {
      await this.repo.updateIndicadores(id, puntos);
    }
    const ok = await this.repo.insertIndicador(dto.newInd, dto.newIndPuntos);
    return { status: ok ? 'OK' : 'ERROR' };
  }

  async estadoIndicador(dto: EstadoIndicadorDto, perfil: number) {
    this.assertAdmin(perfil);
    const pendientes = await this.repo.countAuditoriasPendientes();
    if (pendientes > 0) return { result: 3 };

    const ok = await this.repo.estadoIndicador(dto.id_indicador, dto.estado);
    return { result: ok ? dto.estado : 0 };
  }

  async getItemsPorIndicador(dto: IdIndicadorDto) {
    const items = await this.repo.getItems(dto.id_indicador);
    return items.map((item) => ({
      id_item: item.id_item,
      concepto: item.concepto,
      estado: item.estado,
      accionEstado: item.estado === 2 ? 'Inhabilitar' : 'Habilitar',
      nuevoEstado: item.estado === 2 ? 1 : 2,
    }));
  }

  async addItem(dto: AddItemDto, perfil: number) {
    this.assertAdmin(perfil);
    const idItem = await this.repo.insertItemXind(dto.id_indicador, dto.concepto);
    if (idItem <= 0) return { result: 0 };

    try {
      await this.repo.addPreguntaAuditoria(idItem);
      return { result: idItem };
    } catch {
      return { result: 2 };
    }
  }

  async estadoItem(dto: EstadoItemDto, perfil: number) {
    this.assertAdmin(perfil);
    const pendientes = await this.repo.countAuditoriasPendientes();
    if (pendientes > 0) return { result: 3 };

    const ok = await this.repo.estadoItem(dto.id_item, dto.estado);
    return { result: ok ? dto.estado : 0 };
  }

  async getItemsObs(dto: IdIndicadorDto) {
    const items = await this.repo.getItems(dto.id_indicador);
    return items;
  }

  async getObsPorItem(dto: IdItemDto) {
    const obs = await this.repo.getObsXitem(dto.id_item);
    return obs.map((o) => ({
      id_obs: o.id_obs,
      observacion: o.observacion,
      estado: o.estado,
      accionEstado: o.estado === 2 ? 'Inhabilitar' : 'Habilitar',
      nuevoEstado: o.estado === 2 ? 1 : 2,
    }));
  }

  async addObs(dto: AddObsDto, perfil: number) {
    this.assertAdmin(perfil);
    const ok = await this.repo.insertObsXitem(dto.id_item, dto.obs);
    return { result: ok ? 1 : 0 };
  }

  async estadoObs(dto: EstadoObsDto, perfil: number) {
    this.assertAdmin(perfil);
    const pendientes = await this.repo.countAuditoriasPendientes();
    if (pendientes > 0) return { result: 3 };

    const ok = await this.repo.estadoObservacion(dto.id_obs, dto.estado);
    return { result: ok ? dto.estado : 0 };
  }

  async sendEmail(dto: IdAuditoriaDto, perfil: number) {
    this.assertAdmin(perfil);

    const info = await this.repo.getAuditoriaEmail(dto.id_auditoria);
    if (!info) return { message: 'Error' };

    const auditoria = await this.repo.getAuditoriaId(dto.id_auditoria);
    if (!auditoria) return { message: 'Error' };

    const observacionesHtml = await this.buildObservacionesEmail(auditoria);
    return this.emailService.enviarAuditoria(info, observacionesHtml);
  }

  private async buildObservacionesEmail(
    auditoria: Record<string, unknown>,
  ): Promise<string> {
    const [indicadores, allItems] = await Promise.all([
      this.repo.getIndicadores(),
      this.repo.getAllItems(false),
    ]);
    const itemsNo: Array<{ id_item: number; concepto: string }> = [];

    for (const item of allItems) {
      const campo = `item_${item.id_item}`;
      if (Number(auditoria[campo]) === 2) {
        itemsNo.push({ id_item: item.id_item, concepto: item.concepto });
      }
    }

    if (itemsNo.length === 0) {
      return '<ol></ol>';
    }

    const obsRows = await this.repo.getObsActivasByItems(
      itemsNo.map((i) => i.id_item),
    );
    const obsByItem = new Map<number, typeof obsRows>();
    for (const o of obsRows) {
      const list = obsByItem.get(o.id_item) ?? [];
      list.push(o);
      obsByItem.set(o.id_item, list);
    }

    const items: string[] = [];
    for (const item of itemsNo) {
      const obs = obsByItem.get(item.id_item) ?? [];
      for (const o of obs) {
        items.push(
          `<li><strong>No ${item.concepto}: </strong>${o.observacion}</li>`,
        );
      }
    }

    return `<ol>${items.join('')}</ol>`;
  }

  async compromisoAgente(dto: CompromisoAgenteDto, nitAgente: number) {
    const auditoria = await this.repo.getAuditoriaId(dto.id_auditoria);
    if (!auditoria || Number(auditoria['nit_agente']) !== nitAgente) {
      throw new ForbiddenException('No autorizado');
    }

    const ok = await this.repo.insertCompromisoAuditoria(
      dto.id_auditoria,
      dto.compromisos,
    );
    return { status: ok ? 'OK' : 'ERROR' };
  }

  async cargarInfDetalle(dto: InfDetalleDto, perfil: number) {
    this.assertAdmin(perfil);
    const [year, month] = dto.AuditoriaMes.split('-').map(Number);
    const rows = await this.repo.getDetalleAuditoria(
      dto.nitAgente,
      year,
      month,
    );

    if (rows.length === 0) {
      return {
        filas: [],
        mensaje:
          'No se encontraron auditorías en la fecha indicada al agente seleccionado.',
      };
    }

    let sumaPuntos = 0;
    const filas = rows.map((row) => {
      const puntuacion = row['puntuacion'];
      if (puntuacion != null && puntuacion !== '') {
        sumaPuntos += Number(puntuacion);
      }
      return {
        fecha: row['fecha_c'],
        puntuacion: row['puntuacion'],
        id_auditoria: row['id_auditoria'],
        puedeVer: puntuacion != null && puntuacion !== '',
        puedeEditar: puntuacion == null,
      };
    });

    const promedio = filas.length > 0 ? sumaPuntos / filas.length : 0;

    return {
      filas,
      promedio: Math.round(promedio),
      sumaPuntos,
      cantidad: filas.length,
    };
  }

  async validateCantAuditorias() {
    const cantidad = await this.repo.countAuditoriasPendientes();
    return { cantidad };
  }

  getContextoListado(perfil: number) {
    return {
      esAdmin: esAdminContactCenter(perfil),
      esAgente: esAgenteContactCenter(perfil),
    };
  }
}
