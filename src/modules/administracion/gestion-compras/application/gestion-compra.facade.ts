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
    idEmpresa?: number,
  ) {
    return this.crearSolicitudUC.execute(dto, userId, idEmpresa);
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

  cambiarEstado(id: bigint, dto: CambiarEstadoCompraDto) {
    return this.cambiarEstadoUC.execute(id, dto);
  }

  marcarConFactura(id: bigint, conFactura: string) {
    return this.marcarConFacturaUC.execute(id, conFactura);
  }

  crearMensaje(
    solicitudId: bigint,
    nitUsuario: number,
    dto: CrearMensajeCompraDto,
  ) {
    return this.gestionMensajesUC.crearMensaje(solicitudId, nitUsuario, dto);
  }

  listarMensajes(solicitudId: bigint) {
    return this.gestionMensajesUC.listarMensajes(solicitudId);
  }

  enviarAutorizacion(solicitudId: bigint, dto: EnviarAutorizacionCompraDto) {
    return this.enviarAutorizacionUC.execute(solicitudId, dto);
  }

  exportarExcel(
    filtros: FiltrosComprasDto | undefined,
    sesion: SesionListarCompras,
  ): Promise<Buffer> {
    return this.exportarComprasExcelUC.execute(filtros, sesion);
  }
}
