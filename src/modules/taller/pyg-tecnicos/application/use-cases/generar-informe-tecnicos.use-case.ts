import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GenerarInformeTecnicosResponseEntity,
  InformeTecnicoCalculadoEntity,
} from '../../domain/entities/pyg-tecnicos.entity';
import { IPygTecnicosRepository } from '../../domain/repositories/pyg-tecnicos.repository.interface';
import { GenerarInformeDto } from '../dto/generar-informe.dto';
import { assertPygPeriodo } from '../../../shared/pyg-periodo';

@Injectable()
export class GenerarInformeTecnicosUseCase {
  constructor(private readonly repository: IPygTecnicosRepository) {}

  async execute(
    dto: GenerarInformeDto,
  ): Promise<GenerarInformeTecnicosResponseEntity> {
    const { monthOne, monthTwo } = assertPygPeriodo(dto);

    const dataInforme = await this.repository.getDataInforme(
      dto.yearOne,
      monthOne,
      monthTwo,
    );
    const dataComparar = await this.repository.getComparacionInforme(
      dto.yearTwo,
      monthOne,
      monthTwo,
    );

    if (!dataInforme.length) {
      throw new NotFoundException('No se encontraron datos');
    }

    const compararByNit = new Map(
      dataComparar.map((row) => [row.nit, row.utilidad_anterior]),
    );

    const filasSinRnk: Omit<InformeTecnicoCalculadoEntity, 'rnk'>[] =
      dataInforme.map((row) => {
        const utilidad =
          row.mano_obra +
          row.repuestos -
          row.costo_rep -
          row.costo_tot -
          row.costo_mo;
        const ticket_total =
          row.entradas !== 0
            ? (row.mano_obra + row.repuestos) / row.entradas
            : 0;
        const total_horas =
          row.horas_cliente +
          row.horas_garantia +
          row.horas_internas +
          row.horas_servicio;
        const horasFacturables = row.horas_cliente + row.horas_garantia;
        const valor_hora =
          horasFacturables === 0 ? 0 : row.mano_obra / horasFacturables;

        const utilidad_year = compararByNit.get(row.nit) ?? 0;

        return {
          taller: row.taller,
          nombre: row.nombre,
          mano_obra: row.mano_obra,
          repuestos: row.repuestos,
          utilidad,
          utilidad_year,
          ticket_total,
          horas_cliente: row.horas_cliente,
          horas_garantia: row.horas_garantia,
          horas_internas: row.horas_internas,
          horas_servicio: row.horas_servicio,
          total_horas,
          valor_hora,
          fecha_ini: row.fecha_ini,
          dias_vacaciones: row.dias_vacaciones,
          costo_mo: row.costo_mo,
        };
      });

    filasSinRnk.sort((a, b) => b.utilidad - a.utilidad);

    const filas: InformeTecnicoCalculadoEntity[] = filasSinRnk.map(
      (row, index) => ({
        rnk: index + 1,
        ...row,
      }),
    );

    return {
      yearComparar: dto.yearTwo,
      filas,
    };
  }
}
