import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntradasVariasEmailService } from '../../shared/application/entradas-varias-email.service';
import { GenerarFormatoEntregaPdfService } from '../../shared/application/generar-formato-entrega-pdf.service';
import {
  IEntradasVariasRepository,
  SolicitudEvDetalleRow,
} from '../../shared/domain/entradas-varias.repository';
import {
  puedeAutorizarEv,
  puedeGestionarEvSv,
  puedeGestionarSolicitudPendiente,
  puedeMarcarEntregado,
  resolverAlcanceListadoEv,
} from '../../shared/domain/ev-permisos';
import {
  AutorizarSolicitudEvDto,
  DetalleSolicitudEvDto,
  ListarSolicitudesEvDto,
  MarcarEntregadoDto,
  RegistrarEvDto,
  RegistrarSvDto,
} from './dto/solicitudes-ev.dto';

export type SolicitudEvListItem = {
  id: number;
  nOrden: number;
  placa: string | null;
  bodega: string | null;
  fechaRegistro: string;
  solicitadoPor: string | null;
  obsRegistro: string;
  fechaAuth: string | null;
  autorizadoPor: string | null;
  obsAuth: string | null;
  estadoAuth: number | null;
  puedeGestionar: boolean;
};

export type DetalleLineaGestion = {
  id: number;
  referencia: string;
  descripcion: string;
  cantidad: number;
  stock: Array<{ bodega: number; descripcion: string; stock: number }>;
  estadoAuth: number | null;
  puedeAutorizar: boolean;
  autorizacionLabel: string | null;
  numeroEv: string | null;
  numeroSv: string | null;
  obsEv: string | null;
  obsSv: string | null;
  entregado: string | number | null;
  puedeRegistrarEv: boolean;
  puedeRegistrarSv: boolean;
  puedeMarcarEntregado: boolean;
  colorFila: 'verde' | 'rojo' | 'neutral';
};

@Injectable()
export class SolicitudesEvFacade {
  constructor(
    private readonly repo: IEntradasVariasRepository,
    private readonly emailService: EntradasVariasEmailService,
    private readonly pdfService: GenerarFormatoEntregaPdfService,
  ) {}

  listarBodegas() {
    return this.repo.listarBodegas();
  }

  async listar(
    dto: ListarSolicitudesEvDto,
    userId: number,
    perfil: number,
  ): Promise<SolicitudEvListItem[]> {
    const scope = resolverAlcanceListadoEv(userId, perfil, false);
    const filtros = {
      idSolicitud: dto.idSolicitud,
      nOrden: dto.nOrden,
      placa: dto.placa?.toUpperCase(),
      bodega: dto.bodega,
      fechaRegistro: dto.fechaRegistro,
      userRegister: scope.soloPropias ? userId : undefined,
      bodegasIn: scope.bodegasIn,
    };

    const rows = await this.repo.listarSolicitudes(filtros);
    return rows.map((row) => ({
      id: row.id,
      nOrden: row.n_orden,
      placa: row.placa,
      bodega: row.descripcion_bodega,
      fechaRegistro: this.formatDate(row.date_register),
      solicitadoPor: row.nombres,
      obsRegistro: row.obs_register,
      fechaAuth: row.date_auth ? this.formatDate(row.date_auth) : null,
      autorizadoPor: row.nombres_auth,
      obsAuth: row.obs_auth,
      estadoAuth: row.estado_auth,
      puedeGestionar:
        row.estado_auth === 0
          ? puedeGestionarSolicitudPendiente(userId, perfil)
          : true,
    }));
  }

  async obtenerDetalle(
    dto: DetalleSolicitudEvDto,
    userId: number,
    perfil: number,
  ) {
    const solicitud = await this.repo.obtenerSolicitudPorId(dto.idSolicitud);
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const detalle = await this.repo.obtenerDetalleSolicitud(dto.idSolicitud);
    const obsEv = await this.repo.observacionesPorSolicitud(dto.idSolicitud, 0);
    const obsSv = await this.repo.observacionesPorSolicitud(dto.idSolicitud, 1);
    const obsEvMap = this.mapObsPorDetalle(obsEv);
    const obsSvMap = this.mapObsPorDetalle(obsSv);

    const lineas: DetalleLineaGestion[] = [];
    for (const row of detalle) {
      const stock = await this.repo.stockReferencia(row.referencia);
      lineas.push(
        this.mapLineaDetalle(
          row,
          solicitud.bodega ?? 0,
          userId,
          perfil,
          dto.modo,
          obsEvMap.get(row.id) ?? null,
          obsSvMap.get(row.id) ?? null,
          stock.map((s) => ({
            bodega: s.bodega,
            descripcion: s.descripcion,
            stock: Number(s.stock),
          })),
        ),
      );
    }

    return {
      solicitud: {
        id: solicitud.id,
        nOrden: solicitud.n_orden,
        bodega: solicitud.bodega,
        estadoAuth: solicitud.estado_auth,
      },
      lineas,
    };
  }

  async autorizar(
    dto: AutorizarSolicitudEvDto,
    userId: number,
    perfil: number,
  ) {
    if (!userId) throw new UnauthorizedException('Sesión inválida');
    if (!puedeAutorizarEv(userId, perfil)) {
      throw new ForbiddenException('No tiene permisos para autorizar');
    }

    let actualizadas = 0;
    let rechazadas = 0;
    for (const linea of dto.lineas) {
      const ok = await this.repo.actualizarDetalleAuth(
        linea.idDetalle,
        dto.idSolicitud,
        linea.estadoAuth,
      );
      if (ok) {
        actualizadas++;
        if (linea.estadoAuth === 2) rechazadas++;
      }
    }

    const resumen = await this.repo.contarDetalleAuth(dto.idSolicitud);
    if (actualizadas === 0 && resumen.pendientes > 0) {
      throw new BadRequestException(
        'Debe autorizar o rechazar cada repuesto pendiente antes de guardar',
      );
    }

    const estadoHeader =
      resumen.rechazadas === resumen.total || actualizadas === rechazadas
        ? 2
        : 1;

    const cerrado = await this.repo.cerrarAuthSolicitud(
      dto.idSolicitud,
      userId,
      dto.obsAuth,
      actualizadas > 0 ? (rechazadas === actualizadas ? 2 : 1) : estadoHeader,
    );

    if (!cerrado) {
      throw new BadRequestException(
        'No se pudo cerrar la autorización de la solicitud',
      );
    }

    const solicitud = await this.repo.obtenerSolicitudPorId(dto.idSolicitud);
    if (solicitud) {
      await this.emailService.notificarAutorizacion(solicitud, dto.idSolicitud);
    }

    return { message: 'Solicitud de entrada varia actualizada con éxito' };
  }

  async registrarEv(dto: RegistrarEvDto, userId: number, perfil: number) {
    if (!puedeGestionarEvSv(perfil)) {
      throw new ForbiddenException('No tiene permisos para registrar EV');
    }
    const ok = await this.repo.registrarEntradaVaria({
      idSolicitud: dto.idSolicitud,
      idDetalle: dto.idDetalle,
      userId,
      tipoEv: dto.tipoEv,
      numeroEv: dto.numeroEv,
      numeroOrdenEv: dto.numeroOrdenEv,
      obs: dto.obs,
    });
    if (!ok) {
      throw new BadRequestException(
        'No se pudo registrar la entrada varia en la línea seleccionada',
      );
    }

    const solicitud = await this.repo.obtenerSolicitudPorId(dto.idSolicitud);
    const detalle = solicitud
      ? await this.repo.detalleParaCorreoEv(dto.idSolicitud)
      : [];
    if (solicitud) {
      await this.emailService.notificarEntradaVaria(
        solicitud,
        detalle,
        dto.idSolicitud,
      );
    }

    return { message: 'Registro realizado con éxito' };
  }

  async registrarSv(dto: RegistrarSvDto, userId: number, perfil: number) {
    if (!puedeGestionarEvSv(perfil)) {
      throw new ForbiddenException('No tiene permisos para registrar SV');
    }
    const ok = await this.repo.registrarSalidaVaria({
      idSolicitud: dto.idSolicitud,
      idDetalle: dto.idDetalle,
      userId,
      tipoSv: dto.tipoSv,
      numeroSv: dto.numeroSv,
      numeroOrdenSv: dto.numeroOrdenSv,
      obs: dto.obs,
    });
    if (!ok) {
      throw new BadRequestException(
        'No se pudo registrar la salida varia en la línea seleccionada',
      );
    }

    const solicitud = await this.repo.obtenerSolicitudPorId(dto.idSolicitud);
    const detalle = await this.repo.detalleParaCorreoSv(
      dto.idSolicitud,
      dto.idDetalle,
    );

    let pdf: Buffer | undefined;
    if (solicitud && detalle.length > 0) {
      pdf = await this.pdfService.generar(solicitud, detalle, {
        numeroSv: dto.numeroSv,
        tipoSv: dto.tipoSv,
        numeroOSv: dto.numeroOrdenSv,
      });
      await this.emailService.notificarSalidaVaria(
        solicitud,
        detalle,
        dto.idSolicitud,
        pdf,
      );
    }

    return { message: 'Registro realizado con éxito' };
  }

  async marcarEntregado(
    dto: MarcarEntregadoDto,
    userId: number,
    perfil: number,
  ) {
    const solicitud = await this.repo.obtenerSolicitudPorId(dto.idSolicitud);
    if (!solicitud?.bodega) {
      throw new BadRequestException('No se pudo determinar la bodega');
    }
    if (!puedeMarcarEntregado(userId, perfil, solicitud.bodega)) {
      throw new ForbiddenException(
        'No tiene permisos para marcar entrega en esta bodega',
      );
    }

    const ok = await this.repo.marcarEntregado(dto.idDetalle, userId);
    if (!ok) {
      throw new BadRequestException(
        'No se pudo marcar el repuesto como entregado',
      );
    }

    const pendientes = await this.repo.pendientesEntrega(dto.idSolicitud);
    if (pendientes === 0) {
      await this.emailService.notificarEntregaCompleta(
        solicitud,
        dto.idSolicitud,
      );
    }

    return { message: 'Repuesto marcado como entregado' };
  }

  private mapLineaDetalle(
    row: SolicitudEvDetalleRow,
    bodega: number,
    userId: number,
    perfil: number,
    modo: 0 | 1,
    obsEv: string | null,
    obsSv: string | null,
    stock: Array<{ bodega: number; descripcion: string; stock: number }>,
  ): DetalleLineaGestion {
    const puedeAuth = puedeAutorizarEv(userId, perfil);
    const gestionaVarias = puedeGestionarEvSv(perfil);

    let autorizacionLabel: string | null = null;
    let puedeAutorizar = false;
    if (row.estado_auth === 1) autorizacionLabel = 'SI';
    else if (row.estado_auth === 2) autorizacionLabel = 'NO';
    else if (modo === 0 && puedeAuth) puedeAutorizar = true;
    else autorizacionLabel = 'PENDIENTE';

    let numeroEv: string | null = null;
    let numeroSv: string | null = null;
    let puedeRegistrarEv = false;
    let puedeRegistrarSv = false;

    if (row.estado_auth === 1) {
      if (!row.numero_ev && gestionaVarias) {
        puedeRegistrarEv = true;
      } else if (row.tipo_ev && row.numero_ev) {
        numeroEv = `${row.tipo_ev}-${row.numero_ev}`;
        if (!row.numero_sv && gestionaVarias) {
          puedeRegistrarSv = true;
        } else if (row.tipo_sv && row.numero_sv) {
          numeroSv = `${row.tipo_sv}-${row.numero_sv}`;
        }
      }
    }

    const puedeEntregar =
      row.estado_auth === 1 &&
      !!row.numero_ev &&
      !!row.numero_sv &&
      !row.entregado &&
      puedeMarcarEntregado(userId, perfil, bodega);

    let entregado: string | number | null = 'Pendiente';
    if (row.estado_auth !== 1) entregado = 'N/A';
    else if (row.entregado) entregado = 'SI';
    else if (!row.numero_ev || !row.numero_sv) entregado = 'N/A';

    let colorFila: 'verde' | 'rojo' | 'neutral' = 'neutral';
    if (row.estado_auth === 1) colorFila = 'verde';
    if (row.estado_auth === 2) colorFila = 'rojo';

    return {
      id: row.id,
      referencia: row.referencia,
      descripcion: row.descripcion,
      cantidad: row.cantidad,
      stock,
      estadoAuth: row.estado_auth,
      puedeAutorizar,
      autorizacionLabel,
      numeroEv,
      numeroSv,
      obsEv,
      obsSv,
      entregado,
      puedeRegistrarEv,
      puedeRegistrarSv,
      puedeMarcarEntregado: puedeEntregar,
      colorFila,
    };
  }

  private mapObsPorDetalle(
    rows: Array<{ id_detalle: number | null; obs: string | null }>,
  ) {
    const map = new Map<number, string>();
    for (const row of rows) {
      if (row.id_detalle == null || !row.obs) continue;
      const prev = map.get(row.id_detalle);
      map.set(row.id_detalle, prev ? `${prev} | ${row.obs}` : row.obs);
    }
    return map;
  }

  private formatDate(value: Date): string {
    const d = new Date(value);
    return d.toISOString().replace('T', ' ').slice(0, 19);
  }
}
