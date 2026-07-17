import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IOrdenesTotRepository,
  ORDENES_TOT_REPOSITORY,
} from '../domain/ordenes-tot.repository';
import { CrearRepuestoDto } from './dto/crear-repuesto.dto';
import { CrearTotDto } from './dto/crear-tot.dto';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { OrdenesTotPdfService } from './ordenes-tot-pdf.service';

@Injectable()
export class OrdenesTotFacade {
  constructor(
    @Inject(ORDENES_TOT_REPOSITORY)
    private readonly repo: IOrdenesTotRepository,
    private readonly pdfService: OrdenesTotPdfService,
  ) {}

  async crearVehiculo(dto: CrearVehiculoDto, idUsuario: number) {
    await this.repo.insertVehiculoORepuesto(
      String(dto.placa).trim(),
      String(dto.orden).trim(),
      idUsuario,
      'vehiculo',
    );
    return { ok: true };
  }

  async crearRepuesto(dto: CrearRepuestoDto, idUsuario: number) {
    await this.repo.insertVehiculoORepuesto(
      String(dto.placa).trim(),
      String(dto.orden).trim(),
      idUsuario,
      'repuesto',
    );
    return { ok: true };
  }

  async crearTot(dto: CrearTotDto, idUsuario: number): Promise<Buffer> {
    const orden = String(dto.orden).trim();
    const abiertas = await this.repo.countOtAbiertas(orden);
    if (abiertas === 0) {
      throw new BadRequestException('La orden no está abierta');
    }

    const placa = (dto.placa?.trim() || '0').slice(0, 50);
    await this.repo.insertTot({
      placa,
      orden,
      idUsuario,
      proveedor: dto.proveedor?.trim() || null,
      contenido: dto.contenido?.trim() || null,
    });

    const id = await this.repo.getUltimoIdByOrden(orden);
    if (id == null) {
      throw new BadRequestException('No se pudo obtener el id del TOT creado');
    }

    return this.generarPdfRecibo(id);
  }

  async listarTot(idUsuario: number, estado: 1 | 2, nit?: number) {
    const sedes = await this.resolverSedes(idUsuario, nit);
    if (sedes.length === 0) return [];
    return this.repo.listarTot(sedes, estado);
  }

  async marcarReingreso(idVehiculo: number) {
    const ok = await this.repo.marcarReingreso(idVehiculo);
    if (!ok) {
      throw new BadRequestException('No se pudo marcar el reingreso');
    }
    return { ok: true };
  }

  async porteriaVehiculos() {
    return this.repo.infoVehiculoPorteria();
  }

  async porteriaTot(idUsuario: number, nit?: number) {
    const sedes = await this.resolverSedes(idUsuario, nit);
    if (sedes.length === 0) return [];
    return this.repo.infoTotPorteria(sedes);
  }

  async porteriaOrdenesGenerales() {
    return this.repo.infoOrdGralPorteria();
  }

  /** Sedes del usuario: primero por id_usuario; si vacío, fallback por nit. */
  private async resolverSedes(idUsuario: number, nit?: number): Promise<number[]> {
    const byId = await this.repo.getSedesByIdUsuario(idUsuario);
    if (byId.length > 0) return byId;
    if (nit != null && nit > 0) {
      return this.repo.getSedesByNit(nit);
    }
    return [];
  }

  async confirmarSalida(idVehiculo: number) {
    const ok = await this.repo.confirmarSalida(idVehiculo);
    if (!ok) {
      throw new BadRequestException('No se pudo confirmar la salida');
    }
    return { ok: true };
  }

  async validarOrden(orden: string | number) {
    const n = await this.repo.countOtAbiertas(String(orden).trim());
    return { abierta: n > 0 };
  }

  async generarPdfRecibo(idVehiculo: number): Promise<Buffer> {
    const info = await this.repo.infoTotRecibo(idVehiculo);
    if (!info) {
      throw new NotFoundException('No se encontró información del recibo TOT');
    }
    return this.pdfService.generarRecibo(info);
  }

  async listarVehiculosPendientes(idUsuario: number, nit?: number) {
    const sedes = await this.resolverSedes(idUsuario, nit);
    if (sedes.length === 0) return [];
    return this.repo.listarVehiculosPendientes(sedes);
  }

  async listarRepuestosCandidatos() {
    return this.repo.listarRepuestosCandidatos();
  }
}
