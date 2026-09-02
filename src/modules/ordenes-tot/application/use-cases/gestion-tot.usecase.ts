import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IOrdenesTotRepository,
  TotListadoPage,
} from '../../domain/ordenes-tot.repository';
import { CrearTotDto } from '../dto/crear-tot.dto';
import { OrdenesTotPdfService } from '../ordenes-tot-pdf.service';
import { ResolverSedesUseCase } from './resolver-sedes.usecase';

@Injectable()
export class GestionTotUseCase {
  constructor(
    private readonly repo: IOrdenesTotRepository,
    private readonly resolverSedes: ResolverSedesUseCase,
    private readonly pdfService: OrdenesTotPdfService,
  ) {}

  async crear(dto: CrearTotDto, idUsuario: number): Promise<Buffer> {
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

  async listar(
    idUsuario: number,
    estado: 1 | 2,
    nit: number | undefined,
    page: number,
    limit: number,
  ): Promise<TotListadoPage> {
    const sedes = await this.resolverSedes.execute(idUsuario, nit);
    if (sedes.length === 0) return { items: [], total: 0 };

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
    const offset = (safePage - 1) * safeLimit;
    const [total, items] = await Promise.all([
      this.repo.countTot(sedes, estado),
      this.repo.listarTot(sedes, estado, offset, safeLimit),
    ]);
    return { items, total };
  }

  async marcarReingreso(idVehiculo: number) {
    const ok = await this.repo.marcarReingreso(idVehiculo);
    if (!ok) {
      throw new BadRequestException('No se pudo marcar el reingreso');
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
}
