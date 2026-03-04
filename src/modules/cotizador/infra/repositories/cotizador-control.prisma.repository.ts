import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  FilaControlRepuesto,
  ICotizadorControlRepository,
} from '../../domain/cotizador-control.repository';

@Injectable()
export class CotizadorControlPrismaRepository implements ICotizadorControlRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getControlRepuestos(): Promise<FilaControlRepuesto[]> {
    const rows = await this.prisma.$queryRaw<FilaControlRepuesto[]>`
      SELECT * FROM v_control_rep_cotiza_minymax
    `;
    return rows ?? [];
  }
}
