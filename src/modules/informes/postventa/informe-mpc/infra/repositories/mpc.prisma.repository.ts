import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IMpcRepository } from '../../domain/mpc.repository';
import { MpcInformeRowEntity } from '../../domain/mpc.entity';

@Injectable()
export class MpcPrismaRepository implements IMpcRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<MpcInformeRowEntity[]> {
    const sql = Prisma.sql`
      SELECT
        v.fecha_registro,
        v.placa,
        v.des_modelo,
        v.plan_vendido,
        v.valor_mpc,
        v.val_redimido,
        (v.valor_mpc - v.val_redimido) AS saldo_mpc,
        v.vendido_por,
        c.estado
      FROM v_Informe_mpc v
      LEFT JOIN postv_mpc_casos_especiales c
        ON v.placa = c.placa
      ORDER BY v.fecha_registro DESC, v.placa
    `;

    const rows = await this.prisma.$queryRaw<
      {
        fecha_registro: string;
        placa: string;
        des_modelo: string;
        plan_vendido: string;
        valor_mpc: number;
        val_redimido: number;
        saldo_mpc: number;
        vendido_por: string;
        estado: number | null;
      }[]
    >(sql);

    return rows.map(
      (r) =>
        new MpcInformeRowEntity({
          fechaRegistro: r.fecha_registro,
          placa: r.placa,
          desModelo: r.des_modelo,
          planVendido: r.plan_vendido,
          valorMpc: r.valor_mpc,
          valorRedimido: r.val_redimido,
          saldoMpc: r.saldo_mpc,
          vendidoPor: r.vendido_por,
          estadoCasoEspecial: (r.estado as 0 | 1 | null) ?? null,
        }),
    );
  }

  async cambiarEstadoCasoEspecial(
    placa: string,
    estado: number,
    userId: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        IF OBJECT_ID('tempdb..#temp_user') IS NOT NULL
          DROP TABLE #temp_user;
        CREATE TABLE #temp_user (userId VARCHAR(50));
      `;

      try {
        await tx.$executeRaw`
          INSERT INTO #temp_user (userId)
          VALUES (${String(userId)})
        `;

        const existsRows = await tx.$queryRaw<{ cantidad: number }[]>`
          SELECT COUNT(*) AS cantidad
          FROM postv_mpc_casos_especiales
          WHERE placa = ${placa}
        `;
        const exists = (existsRows?.[0]?.cantidad ?? 0) > 0;

        if (exists) {
          await tx.$executeRaw`
            UPDATE postv_mpc_casos_especiales
            SET estado = ${estado},
                fecha_registro = CONVERT(VARCHAR(19), GETDATE(), 126)
            WHERE placa = ${placa}
          `;
        } else {
          await tx.$executeRaw`
            INSERT INTO postv_mpc_casos_especiales (placa, estado, fecha_registro)
            VALUES (${placa}, 1, CONVERT(VARCHAR(19), GETDATE(), 126))
          `;
        }
      } finally {
        await tx.$executeRaw`
          IF OBJECT_ID('tempdb..#temp_user') IS NOT NULL
            DROP TABLE #temp_user;
        `;
      }
    });
  }
}
