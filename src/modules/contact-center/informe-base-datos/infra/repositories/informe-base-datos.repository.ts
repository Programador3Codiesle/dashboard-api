import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ConsultarInformeBaseDatosDto } from '../../application/dto/informe-base-datos.dto';

@Injectable()
export class InformeBaseDatosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async consultarPorTiempo(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT * FROM v_bdc_tiempo_chevrolet
      WHERE proxima >= ${fechaInicio} AND proxima <= ${fechaFin}
    `);
  }

  async consultarPorKm(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT * FROM v_bdc_km_chevrolet
      WHERE fin >= ${fechaInicio} AND inicio <= ${fechaFin}
    `);
  }

  async consultarPorFechaEntrega(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT * FROM v_bdc_fechacompra_chevrolet
      WHERE proxima >= ${fechaInicio} AND proxima <= ${fechaFin}
    `);
  }

  async consultar(dto: ConsultarInformeBaseDatosDto): Promise<Record<string, unknown>[]> {
    switch (dto.tipoInfDB) {
      case '1':
        if (!dto.dateStart) return [];
        return this.consultarPorTiempo(dto.dateStart, dto.dateEnd);
      case '2':
        if (!dto.dateStart) return [];
        return this.consultarPorKm(dto.dateStart, dto.dateEnd);
      case '3':
      default:
        if (!dto.dateStart) return [];
        return this.consultarPorFechaEntrega(dto.dateStart, dto.dateEnd);
    }
  }
}
