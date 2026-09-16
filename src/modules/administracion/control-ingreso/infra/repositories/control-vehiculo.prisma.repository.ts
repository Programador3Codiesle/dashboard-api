import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { CODIESEL_EMPRESA_ID } from '../../../../../core/config/empresa-sesion';
import {
  ControlVehiculoListRow,
  IControlVehiculoRepository,
} from '../../domain/control-vehiculo.repository';
import { ControlVehiculoEntity } from '../../domain/control-vehiculo.entity';

type RawVehiculoRow = {
  id: bigint | number;
  fecha_salida: Date | string;
  km_salida: bigint | number;
  placa: string;
  tipo_vehiculo: string;
  conductor: string;
  pasajeros: string | null;
  persona_autorizo: string | null;
  fecha_llegada: Date | string | null;
  km_llegada: bigint | number | null;
  porteria: string;
  observacion: string | null;
  placa_vh_remolcado: string | null;
  modelo: number | null;
  taller: string | null;
  otra_marca: string | null;
  id_empresa?: number | null;
  modelo_descripcion?: string | null;
  empresa_nombre?: string | null;
  fecha_salida_fmt?: string | null;
  hora_salida_fmt?: string | null;
  fecha_llegada_fmt?: string | null;
  hora_llegada_fmt?: string | null;
};

function esErrorColumnaEmpresa(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('id_empresa') || msg.includes('Invalid column name');
}

@Injectable()
export class ControlVehiculoPrismaRepository implements IControlVehiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrarSalida(data: Partial<ControlVehiculoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }> {
    try {
      const inserted = await this.insertarSalida(data);

      let empresaNombre: string | null = null;
      if (inserted.id_empresa) {
        const empresas = await this.prisma.$queryRaw<Array<{ nombre: string }>>(
          Prisma.sql`SELECT nombre FROM sw_empresa WHERE id = ${Number(inserted.id_empresa)}`,
        );
        empresaNombre = empresas[0]?.nombre ?? null;
      }

      const entity = this.mapToEntity(inserted);
      (entity as ControlVehiculoListRow).empresa_nombre =
        empresaNombre ?? undefined;

      return {
        status: true,
        message: 'Salida registrada correctamente',
        data: entity,
      };
    } catch {
      return {
        status: false,
        message: 'Ha ocurrido un error al guardar la información',
      };
    }
  }

  async registrarLlegada(
    id: number,
    km_llegada: bigint,
    idEmpresa: number,
    observacion?: string,
  ): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }> {
    try {
      try {
        return await this.ejecutarLlegada(
          id,
          km_llegada,
          idEmpresa,
          observacion,
          true,
        );
      } catch (firstErr: unknown) {
        if (!esErrorColumnaEmpresa(firstErr)) {
          return {
            status: false,
            message: 'Ha ocurrido un error al guardar la información',
          };
        }
        if (idEmpresa !== CODIESEL_EMPRESA_ID) {
          return {
            status: false,
            message: 'No se encontró el registro de salida',
          };
        }
        return this.ejecutarLlegada(
          id,
          km_llegada,
          idEmpresa,
          observacion,
          false,
        );
      }
    } catch {
      return {
        status: false,
        message: 'Ha ocurrido un error al guardar la información',
      };
    }
  }

  async listar(
    perfil: number | undefined,
    idEmpresa: number,
  ): Promise<ControlVehiculoListRow[]> {
    try {
      return await this.ejecutarListar(perfil, idEmpresa, true);
    } catch (firstErr: unknown) {
      if (!esErrorColumnaEmpresa(firstErr)) throw firstErr;
      if (idEmpresa !== CODIESEL_EMPRESA_ID) {
        return [];
      }
      return this.ejecutarListar(perfil, idEmpresa, false);
    }
  }

  async findById(id: bigint): Promise<ControlVehiculoEntity | null> {
    try {
      const result = await this.prisma.$queryRaw<RawVehiculoRow[]>`
        SELECT
          id, fecha_salida, km_salida, placa, tipo_vehiculo,
          conductor, pasajeros, persona_autorizo, fecha_llegada,
          km_llegada, porteria, observacion, placa_vh_remolcado,
          modelo, taller, otra_marca
        FROM postv_control_ing_sal_vehiculos
        WHERE id = ${id}
      `;

      if (!result || result.length === 0) return null;

      return this.mapToEntity(result[0]);
    } catch {
      return null;
    }
  }

  async listarVehiculosModelos(): Promise<
    Array<{ id: number; descripcion: string }>
  > {
    return this.prisma.vh_familias.findMany({
      select: {
        id: true,
        descripcion: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  private async ejecutarLlegada(
    id: number,
    km_llegada: bigint,
    idEmpresa: number,
    observacion: string | undefined,
    conEmpresa: boolean,
  ): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }> {
    const filtroEmpresa = conEmpresa
      ? Prisma.sql`AND ISNULL(id_empresa, ${CODIESEL_EMPRESA_ID}) = ${idEmpresa}`
      : Prisma.empty;

    const result =
      observacion != null && observacion !== ''
        ? await this.prisma.$queryRaw<RawVehiculoRow[]>`
            UPDATE postv_control_ing_sal_vehiculos
            SET fecha_llegada = GETDATE(),
                km_llegada = ${km_llegada},
                observacion = ${observacion}
            OUTPUT INSERTED.*
            WHERE id = ${id}
            ${filtroEmpresa}
          `
        : await this.prisma.$queryRaw<RawVehiculoRow[]>`
            UPDATE postv_control_ing_sal_vehiculos
            SET fecha_llegada = GETDATE(),
                km_llegada = ${km_llegada}
            OUTPUT INSERTED.*
            WHERE id = ${id}
            ${filtroEmpresa}
          `;

    const updated = result[0];
    if (!updated) {
      return {
        status: false,
        message: 'No se encontró el registro de salida',
      };
    }

    return {
      status: true,
      message: 'Llegada registrada correctamente',
      data: this.mapToEntity(updated),
    };
  }

  private async insertarSalida(
    data: Partial<ControlVehiculoEntity>,
  ): Promise<RawVehiculoRow> {
    const result = await this.prisma.$queryRaw<RawVehiculoRow[]>`
      INSERT INTO postv_control_ing_sal_vehiculos
      (km_salida, placa, tipo_vehiculo, conductor, pasajeros, persona_autorizo,
       porteria, modelo, taller, otra_marca, placa_vh_remolcado, id_empresa)
      OUTPUT INSERTED.*
      VALUES
      (${data.km_salida ?? BigInt(0)}, ${data.placa}, ${data.tipo_vehiculo},
       ${data.conductor}, ${data.pasajeros ?? null},
       ${data.persona_autorizo ?? null}, ${data.porteria},
       ${data.modelo ?? null}, ${data.taller ?? null},
       ${data.otra_marca ?? null},
       ${data.placa_vh_remolcado ?? null},
       ${data.id_empresa ?? null})
    `;
    return result[0];
  }

  private async ejecutarListar(
    perfil: number | undefined,
    idEmpresa: number,
    conEmpresa: boolean,
  ): Promise<ControlVehiculoListRow[]> {
    const filtros: Prisma.Sql[] = [];
    if (conEmpresa) {
      filtros.push(
        Prisma.sql`ISNULL(ctrl.id_empresa, ${CODIESEL_EMPRESA_ID}) = ${idEmpresa}`,
      );
    }
    if (perfil !== 1) {
      filtros.push(Prisma.sql`ctrl.fecha_llegada IS NULL`);
    }
    const whereSql =
      filtros.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(filtros, ' AND ')}`
        : Prisma.empty;

    const joinEmpresa = conEmpresa
      ? Prisma.sql`LEFT JOIN sw_empresa AS se ON se.id = ISNULL(ctrl.id_empresa, ${CODIESEL_EMPRESA_ID})`
      : Prisma.sql`LEFT JOIN sw_empresa AS se ON 1 = 0`;

    const results = await this.prisma.$queryRaw<RawVehiculoRow[]>`
      SELECT
        ctrl.id,
        ctrl.fecha_salida,
        ctrl.km_salida,
        ctrl.placa,
        ctrl.tipo_vehiculo,
        ctrl.modelo,
        ctrl.otra_marca,
        ctrl.conductor,
        ctrl.pasajeros,
        ctrl.persona_autorizo,
        ctrl.fecha_llegada,
        ctrl.km_llegada,
        ctrl.observacion,
        ctrl.placa_vh_remolcado,
        ctrl.porteria,
        ctrl.taller,
        CONVERT(VARCHAR, ctrl.fecha_salida, 23) AS fecha_salida_fmt,
        FORMAT(ctrl.fecha_salida, 'hh:mm tt', 'en-US') AS hora_salida_fmt,
        CONVERT(VARCHAR, ctrl.fecha_llegada, 23) AS fecha_llegada_fmt,
        FORMAT(ctrl.fecha_llegada, 'hh:mm tt', 'en-US') AS hora_llegada_fmt,
        CASE
          WHEN ctrl.modelo = -1 THEN ctrl.otra_marca
          WHEN ctrl.modelo > 0 THEN fam.descripcion
        END AS modelo_descripcion,
        se.nombre AS empresa_nombre
      FROM postv_control_ing_sal_vehiculos AS ctrl
      LEFT JOIN vh_familias AS fam ON fam.id = ctrl.modelo
      ${joinEmpresa}
      ${whereSql}
      ORDER BY ctrl.id DESC
    `;

    return results.map((row) => ({
      ...this.mapToEntity(row),
      modelo_descripcion: row.modelo_descripcion ?? undefined,
      empresa_nombre: row.empresa_nombre ?? undefined,
      fecha_salida_fmt: row.fecha_salida_fmt ?? undefined,
      hora_salida_fmt: row.hora_salida_fmt ?? undefined,
      fecha_llegada_fmt: row.fecha_llegada_fmt ?? null,
      hora_llegada_fmt: row.hora_llegada_fmt ?? null,
    }));
  }

  private mapToEntity(data: RawVehiculoRow): ControlVehiculoEntity {
    return new ControlVehiculoEntity({
      id: BigInt(data.id),
      fecha_salida: data.fecha_salida
        ? new Date(data.fecha_salida)
        : new Date(),
      km_salida: BigInt(data.km_salida ?? 0),
      placa: data.placa,
      tipo_vehiculo: data.tipo_vehiculo,
      conductor: data.conductor,
      pasajeros: data.pasajeros,
      persona_autorizo: data.persona_autorizo,
      fecha_llegada: data.fecha_llegada ? new Date(data.fecha_llegada) : null,
      km_llegada: data.km_llegada != null ? BigInt(data.km_llegada) : null,
      porteria: data.porteria,
      observacion: data.observacion,
      placa_vh_remolcado: data.placa_vh_remolcado,
      modelo: data.modelo != null ? Number(data.modelo) : null,
      taller: data.taller,
      otra_marca: data.otra_marca,
      id_empresa: data.id_empresa != null ? Number(data.id_empresa) : null,
    });
  }
}
