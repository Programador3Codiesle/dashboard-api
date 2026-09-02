import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GenerarInformeResponseEntity,
  InformeAsesorCalculadoEntity,
} from '../../domain/entities/pyg-asesores-repuestos.entity';
import { IPygAsesoresRepuestosRepository } from '../../domain/repositories/pyg-asesores-repuestos.repository.interface';
import { GenerarInformeDto } from '../dto/generar-informe.dto';
import { assertPygPeriodo } from '../../../shared/pyg-periodo';

@Injectable()
export class GenerarInformeAsesoresUseCase {
  constructor(private readonly repository: IPygAsesoresRepuestosRepository) {}

  async execute(
    dto: GenerarInformeDto,
    idEmpresa: number,
  ): Promise<GenerarInformeResponseEntity> {
    const { monthOne, monthTwo } = assertPygPeriodo(dto);

    const dataInforme = await this.repository.getDataInformeAsesor(
      dto.yearOne,
      monthOne,
      monthTwo,
      idEmpresa,
    );
    const dataComparar = await this.repository.getComparacionInformeAsesor(
      dto.yearTwo,
      monthOne,
      monthTwo,
      idEmpresa,
    );

    if (!dataInforme.length) {
      throw new NotFoundException('No se encontraron datos');
    }

    const compararByNit = new Map(dataComparar.map((row) => [row.nit, row]));

    const filasSinRnk: Omit<InformeAsesorCalculadoEntity, 'rnk'>[] =
      dataInforme.map((row) => {
        const utilidad_taller = row.venta_taller - row.costo_taller;
        const utilidad_mostrador = row.venta_mostrador - row.costo_mostrador;
        const utilidad_total = utilidad_taller + utilidad_mostrador;

        const comparacion = compararByNit.get(row.nit);
        let utilidad_taller_ant = 0;
        let utilidad_mostrador_ant = 0;
        let utilidad_total_ant = 0;

        if (comparacion) {
          utilidad_taller_ant =
            comparacion.venta_taller - comparacion.costo_taller;
          utilidad_mostrador_ant =
            comparacion.venta_mostrador - comparacion.costo_mostrador;
          utilidad_total_ant = utilidad_taller_ant + utilidad_mostrador_ant;
        }

        return {
          nombres: row.nombres,
          venta_taller: row.venta_taller,
          costo_taller: row.costo_taller,
          utilidad_taller,
          utilidad_taller_ant,
          venta_mostrador: row.venta_mostrador,
          costo_mostrador: row.costo_mostrador,
          utilidad_mostrador,
          utilidad_mostrador_ant,
          utilidad_total,
          utilidad_total_ant,
          salario: row.salario,
          fecha_ini: row.fecha_ini,
          dias: row.dias,
        };
      });

    filasSinRnk.sort((a, b) => b.utilidad_total - a.utilidad_total);

    const filas: InformeAsesorCalculadoEntity[] = filasSinRnk.map(
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
