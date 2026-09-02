import { Injectable } from '@nestjs/common';
import { CrearRepuestoDto } from './dto/crear-repuesto.dto';
import { CrearTotDto } from './dto/crear-tot.dto';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { GestionPorteriaUseCase } from './use-cases/gestion-porteria.usecase';
import { GestionRepuestosUseCase } from './use-cases/gestion-repuestos.usecase';
import { GestionTotUseCase } from './use-cases/gestion-tot.usecase';
import { GestionVehiculosUseCase } from './use-cases/gestion-vehiculos.usecase';

@Injectable()
export class OrdenesTotFacade {
  constructor(
    private readonly vehiculos: GestionVehiculosUseCase,
    private readonly tot: GestionTotUseCase,
    private readonly porteria: GestionPorteriaUseCase,
    private readonly repuestos: GestionRepuestosUseCase,
  ) {}

  crearVehiculo(dto: CrearVehiculoDto, idUsuario: number) {
    return this.vehiculos.crear(dto, idUsuario);
  }

  crearRepuesto(dto: CrearRepuestoDto, idUsuario: number) {
    return this.repuestos.crear(dto, idUsuario);
  }

  crearTot(dto: CrearTotDto, idUsuario: number): Promise<Buffer> {
    return this.tot.crear(dto, idUsuario);
  }

  listarTot(
    idUsuario: number,
    estado: 1 | 2,
    nit: number | undefined,
    page: number,
    limit: number,
  ) {
    return this.tot.listar(idUsuario, estado, nit, page, limit);
  }

  marcarReingreso(idVehiculo: number) {
    return this.tot.marcarReingreso(idVehiculo);
  }

  porteriaVehiculos() {
    return this.porteria.vehiculos();
  }

  porteriaTot(idUsuario: number, nit?: number) {
    return this.porteria.tot(idUsuario, nit);
  }

  porteriaOrdenesGenerales() {
    return this.porteria.ordenesGenerales();
  }

  confirmarSalida(idVehiculo: number) {
    return this.porteria.confirmarSalida(idVehiculo);
  }

  validarOrden(orden: string | number) {
    return this.tot.validarOrden(orden);
  }

  generarPdfRecibo(idVehiculo: number): Promise<Buffer> {
    return this.tot.generarPdfRecibo(idVehiculo);
  }

  listarVehiculosPendientes(idUsuario: number, nit?: number) {
    return this.vehiculos.listarPendientes(idUsuario, nit);
  }

  listarRepuestosCandidatos() {
    return this.repuestos.listarCandidatos();
  }
}
