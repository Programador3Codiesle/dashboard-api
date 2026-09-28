import { Injectable } from '@nestjs/common';
import { CrearSolicitudCompraUseCase } from './use-cases/crear-solicitud-compra.usecase';
import { ListarComprasUseCase } from './use-cases/listar-compras.usecase';
import { ListarUsuariosGerenteCompraUseCase } from './use-cases/listar-usuarios-gerente-compra.usecase';
import { CambiarEstadoCompraUseCase } from './use-cases/cambiar-estado-compra.usecase';
import { MarcarConFacturaCompraUseCase } from './use-cases/marcar-con-factura-compra.usecase';
import { GestionMensajesCompraUseCase } from './use-cases/gestion-mensajes-compra.usecase';
import { EnviarAutorizacionCompraUseCase } from './use-cases/enviar-autorizacion-compra.usecase';
import { ExportarComprasExcelUseCase } from './use-cases/exportar-compras-excel.usecase';
import { CreateGestionCompraDto } from './dto/create-gestion-compra.dto';
import { FiltrosComprasDto } from './dto/filtros-compras.dto';
import { CambiarEstadoCompraDto } from './dto/cambiar-estado-compra.dto';
import { CrearMensajeCompraDto } from './dto/crear-mensaje-compra.dto';
import { EnviarAutorizacionCompraDto } from './dto/enviar-autorizacion-compra.dto';
import { SesionListarCompras } from './visibilidad-compras';

@Injectable()
export class GestionCompraFacade {
  constructor(
    private readonly crearSolicitudUC: CrearSolicitudCompraUseCase,
    private readonly listarComprasUC: ListarComprasUseCase,
    private readonly listarUsuariosGerenteUC: ListarUsuariosGerenteCompraUseCase,
    private readonly cambiarEstadoUC: CambiarEstadoCompraUseCase,
    private readonly marcarConFacturaUC: MarcarConFacturaCompraUseCase,
    private readonly gestionMensajesUC: GestionMensajesCompraUseCase,
    private readonly enviarAutorizacionUC: EnviarAutorizacionCompraUseCase,
    private readonly exportarComprasExcelUC: ExportarComprasExcelUseCase,
  ) {}

  crearSolicitud(
    dto: CreateGestionCompraDto,
    userId: number,
    idEmpresa: number | undefined,
    idUsuario: number,
  ) {
    return this.crearSolicitudUC.execute(dto, userId, idEmpresa, idUsuario);
  }

  listarCompras(
    filtros: FiltrosComprasDto | undefined,
    sesion: SesionListarCompras,
  ) {
    return this.listarComprasUC.execute(filtros, sesion);
  }

  listarUsuariosGerente() {
    return this.listarUsuariosGerenteUC.execute();
  }

  cambiarEstado(
    id: bigint,
    dto: CambiarEstadoCompraDto,
    perfil: number,
    idUsuario: number,
  ) {
    return this.cambiarEstadoUC.execute(id, dto, perfil, idUsuario);
  }

  marcarConFactura(id: bigint, conFactura: string, perfil: number) {
    return this.marcarConFacturaUC.execute(id, conFactura, perfil);
  }

  crearMensaje(
    solicitudId: bigint,
    nitUsuario: number,
    dto: CrearMensajeCompraDto,
    idUsuario: number,
  ) {
    return this.gestionMensajesUC.crearMensaje(
      solicitudId,
      nitUsuario,
      dto,
      idUsuario,
    );
  }

  listarMensajes(solicitudId: bigint) {
    return this.gestionMensajesUC.listarMensajes(solicitudId);
  }

  obtenerCotizacionAprobada(solicitudId: bigint) {
    return this.listarComprasUC.obtenerCotizacionAprobada(solicitudId);
  }

  enviarAutorizacion(
    solicitudId: bigint,
    dto: EnviarAutorizacionCompraDto,
    perfil: number,
    idUsuario: number,
  ) {
    return this.enviarAutorizacionUC.execute(
      solicitudId,
      dto,
      perfil,
      idUsuario,
    );
  }

  exportarExcel(
    filtros: FiltrosComprasDto | undefined,
    sesion: SesionListarCompras,
  ): Promise<Buffer> {
    return this.exportarComprasExcelUC.execute(filtros, sesion);
  }
}
