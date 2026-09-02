import { Injectable } from '@nestjs/common';
import type {
  EquipoHojaVidaPayload,
  SessionUser,
} from '../domain/mantenimiento.repository';
import { CatalogosUseCase } from './use-cases/catalogos.usecase';
import {
  AgregarMensajeUseCase,
  CrearSolicitudUseCase,
  FinalizarSolicitudUseCase,
  GetSolicitudUseCase,
  IniciarSolicitudUseCase,
  ListarCorrectivoUseCase,
  ListarMensajesUseCase,
  UpdateEquipoSolicitudUseCase,
} from './use-cases/correctivo.usecase';
import {
  ActualizarEquipoUseCase,
  CrearEquipoUseCase,
  GetHojaVidaUseCase,
  HistorialEquipoUseCase,
  UpdateHojaVidaUseCase,
} from './use-cases/gestionar-equipo.usecase';
import {
  InformeCorrectivoUseCase,
  InformePreventivoUseCase,
} from './use-cases/informes.usecase';
import {
  GetEquipoUseCase,
  ListarEquiposUseCase,
  NombresFamiliaUseCase,
} from './use-cases/listar-equipos.usecase';
import {
  EliminarOrdenUseCase,
  EventosPreventivoUseCase,
  FinalizarOrdenUseCase,
  GetOrdenPreventivoUseCase,
  IniciarOrdenUseCase,
  ListadoPreventivoUseCase,
  UpdateFechaOrdenUseCase,
  UploadCronogramaUseCase,
} from './use-cases/preventivo.usecase';
import {
  OrdenPreventivoDesdeEquipoUseCase,
  SolicitarRetiroUseCase,
} from './use-cases/retiro-orden-equipo.usecase';
import {
  AutorizarRetiroPublicoUseCase,
  RechazarRetiroPublicoUseCase,
} from './use-cases/retiro-publico.usecase';

export { parseHojaVidaBody } from './utils/parse-hoja-vida';

@Injectable()
export class MantenimientoFacade {
  constructor(
    private readonly catalogosUc: CatalogosUseCase,
    private readonly listarEquiposUc: ListarEquiposUseCase,
    private readonly nombresFamiliaUc: NombresFamiliaUseCase,
    private readonly getEquipoUc: GetEquipoUseCase,
    private readonly crearEquipoUc: CrearEquipoUseCase,
    private readonly actualizarEquipoUc: ActualizarEquipoUseCase,
    private readonly getHojaVidaUc: GetHojaVidaUseCase,
    private readonly updateHojaVidaUc: UpdateHojaVidaUseCase,
    private readonly historialUc: HistorialEquipoUseCase,
    private readonly ordenPreventivoUc: OrdenPreventivoDesdeEquipoUseCase,
    private readonly solicitarRetiroUc: SolicitarRetiroUseCase,
    private readonly autorizarRetiroUc: AutorizarRetiroPublicoUseCase,
    private readonly rechazarRetiroUc: RechazarRetiroPublicoUseCase,
    private readonly listarCorrectivoUc: ListarCorrectivoUseCase,
    private readonly crearSolicitudUc: CrearSolicitudUseCase,
    private readonly iniciarSolicitudUc: IniciarSolicitudUseCase,
    private readonly finalizarSolicitudUc: FinalizarSolicitudUseCase,
    private readonly getSolicitudUc: GetSolicitudUseCase,
    private readonly listarMensajesUc: ListarMensajesUseCase,
    private readonly agregarMensajeUc: AgregarMensajeUseCase,
    private readonly updateEquipoSolicitudUc: UpdateEquipoSolicitudUseCase,
    private readonly eventosPreventivoUc: EventosPreventivoUseCase,
    private readonly listadoPreventivoUc: ListadoPreventivoUseCase,
    private readonly getOrdenPreventivoUc: GetOrdenPreventivoUseCase,
    private readonly iniciarOrdenUc: IniciarOrdenUseCase,
    private readonly finalizarOrdenUc: FinalizarOrdenUseCase,
    private readonly eliminarOrdenUc: EliminarOrdenUseCase,
    private readonly updateFechaOrdenUc: UpdateFechaOrdenUseCase,
    private readonly uploadCronogramaUc: UploadCronogramaUseCase,
    private readonly informePreventivoUc: InformePreventivoUseCase,
    private readonly informeCorrectivoUc: InformeCorrectivoUseCase,
  ) {}

  catalogos() {
    return this.catalogosUc.execute();
  }

  listarEquipos(
    page: number,
    limit: number,
    filter?: string,
    bodega?: string,
    area?: string,
  ) {
    return this.listarEquiposUc.execute(page, limit, filter, bodega, area);
  }

  nombresFamilia(codigoF: string) {
    return this.nombresFamiliaUc.execute(codigoF);
  }

  crearEquipo(
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
    return this.crearEquipoUc.execute(body, hoja, imagenFilename);
  }

  actualizarEquipo(
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
    return this.actualizarEquipoUc.execute(id, body, cvFilename);
  }

  getHojaVida(id: number) {
    return this.getHojaVidaUc.execute(id);
  }

  updateHojaVida(
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
    return this.updateHojaVidaUc.execute(id, body, hoja, imagenFilename);
  }

  getEquipo(id: number) {
    return this.getEquipoUc.execute(id);
  }

  ordenPreventivoDesdeEquipo(
    user: SessionUser,
    body: {
      codigoEquipoMp: string;
      f_requerida: string;
      tiempo_estimado: number;
      descripcionMp: string;
    },
  ) {
    return this.ordenPreventivoUc.execute(user, body);
  }

  historial(id: number) {
    return this.historialUc.execute(id);
  }

  solicitarRetiro(
    user: SessionUser,
    equipoId: number,
    jefeNit: string,
    motivo: string,
    imagen: string,
  ) {
    return this.solicitarRetiroUc.execute(
      user,
      equipoId,
      jefeNit,
      motivo,
      imagen,
    );
  }

  autorizarRetiroPublico(id: number, nitJefe: string) {
    return this.autorizarRetiroUc.execute(id, nitJefe);
  }

  rechazarRetiroPublico(id: number, nitJefe: string) {
    return this.rechazarRetiroUc.execute(id, nitJefe);
  }

  listarCorrectivo(user: SessionUser) {
    return this.listarCorrectivoUc.execute(user);
  }

  crearSolicitud(
    user: SessionUser,
    body: {
      equipoId?: string;
      sedeBodega: string;
      urgencia: string;
      solicitud: string;
    },
    imagen: string | null,
  ) {
    return this.crearSolicitudUc.execute(user, body, imagen);
  }

  iniciarSolicitud(user: SessionUser, id: number, tiempoEstimado: number) {
    return this.iniciarSolicitudUc.execute(user, id, tiempoEstimado);
  }

  finalizarSolicitud(
    user: SessionUser,
    id: number,
    respuesta: string,
    imagenResp: string | null,
  ) {
    return this.finalizarSolicitudUc.execute(user, id, respuesta, imagenResp);
  }

  getSolicitud(id: number) {
    return this.getSolicitudUc.execute(id);
  }

  listarMensajes(id: number) {
    return this.listarMensajesUc.execute(id);
  }

  agregarMensaje(user: SessionUser, id: number, mensaje: string) {
    return this.agregarMensajeUc.execute(user, id, mensaje);
  }

  updateEquipoSolicitud(id: number, idEquipo: number) {
    return this.updateEquipoSolicitudUc.execute(id, idEquipo);
  }

  eventosPreventivo(user: SessionUser) {
    return this.eventosPreventivoUc.execute(user);
  }

  listadoPreventivo(user: SessionUser) {
    return this.listadoPreventivoUc.execute(user);
  }

  getOrdenPreventivo(id: number) {
    return this.getOrdenPreventivoUc.execute(id);
  }

  iniciarOrden(user: SessionUser, id: number, asignado: string) {
    return this.iniciarOrdenUc.execute(user, id, asignado);
  }

  finalizarOrden(
    user: SessionUser,
    id: number,
    observaciones: string,
    piezas: string,
    reasignar = false,
    periodoBody?: string,
  ) {
    return this.finalizarOrdenUc.execute(
      user,
      id,
      observaciones,
      piezas,
      reasignar,
      periodoBody,
    );
  }

  eliminarOrden(id: number) {
    return this.eliminarOrdenUc.execute(id);
  }

  updateFecha(user: SessionUser, id: number, date: string, dateOld: string) {
    return this.updateFechaOrdenUc.execute(user, id, date, dateOld);
  }

  uploadCronograma(user: SessionUser, buffer: Buffer) {
    return this.uploadCronogramaUc.execute(user, buffer);
  }

  informePreventivo(estado?: string, bodega?: string) {
    return this.informePreventivoUc.execute(estado, bodega);
  }

  informeCorrectivo(estado?: string, bodega?: string) {
    return this.informeCorrectivoUc.execute(estado, bodega);
  }
}
