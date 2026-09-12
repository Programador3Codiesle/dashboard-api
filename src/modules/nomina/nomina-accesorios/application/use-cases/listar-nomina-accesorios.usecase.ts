import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { perfilEn } from '../../../shared/perfil';
import {
  NIT_ASESOR_ACCESORIOS_EXCLUIDO,
  NOMBRES_MES_NOMINA_ACCESORIOS,
  PERFILES_NOMINA_ACCESORIOS_SIN_FILTRO_NIT,
  PORC_COMISION_VENTA_COMPARTIDA,
  PORC_COMISION_VENTA_PROPIA,
  TIPOS_INFORME_NOMINA_ACCESORIOS,
  TipoInformeNominaAccesorios,
} from '../../domain/nomina-accesorios.constants';
import {
  NominaAccesoriosAsesorEntity,
  NominaAccesoriosAuxiliarEntity,
  NominaAccesoriosMoInternaEntity,
  NominaAccesoriosOtrasMarcasEntity,
  NominaAccesoriosResultadoEntity,
  NominaAccesoriosTecnicoEntity,
} from '../../domain/nomina-accesorios.entity';
import { INominaAccesoriosRepository } from '../../domain/nomina-accesorios.repository';

const EMPTY_DEFAULT = 'No hay datos para el periodo seleccionado.';

function cellNumber(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (value != null && value !== '') {
      return Number(value);
    }
  }
  return 0;
}

function cellText(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (value instanceof Date) return value.toISOString();
  return '';
}

@Injectable()
export class ListarNominaAccesoriosUseCase {
  constructor(private readonly repository: INominaAccesoriosRepository) {}

  async execute(input: {
    ano: number;
    mes: number;
    tipo: number;
    perfilUsuario: number | null;
    nitUsuarioSesion: number | null;
  }): Promise<NominaAccesoriosResultadoEntity> {
    const { ano, mes, tipo } = input;
    if (!ano || ano < 1) {
      throw new BadRequestException('El parámetro ano es obligatorio.');
    }
    if (!mes || mes < 1 || mes > 12) {
      throw new BadRequestException('El parámetro mes es obligatorio (1-12).');
    }
    if (
      !TIPOS_INFORME_NOMINA_ACCESORIOS.includes(
        tipo as TipoInformeNominaAccesorios,
      )
    ) {
      throw new BadRequestException(
        'El perfil de informe debe estar entre 1 y 5.',
      );
    }

    const veTodos = perfilEn(
      input.perfilUsuario,
      PERFILES_NOMINA_ACCESORIOS_SIN_FILTRO_NIT,
    );
    let nitFiltro: string | null = null;
    if (!veTodos) {
      if (
        !Number.isFinite(input.nitUsuarioSesion) ||
        !input.nitUsuarioSesion ||
        input.nitUsuarioSesion <= 0
      ) {
        throw new BadRequestException(
          'No se pudo determinar el usuario de sesión.',
        );
      }
      nitFiltro = String(input.nitUsuarioSesion);
    }

    const fechaLabel = `${NOMBRES_MES_NOMINA_ACCESORIOS[mes] ?? mes} ${ano}`;
    const tipoInforme = tipo as TipoInformeNominaAccesorios;

    try {
      return await this.cargar(tipoInforme, ano, mes, nitFiltro, fechaLabel);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al consultar la nómina. Contacte al departamento de Sistemas.',
      );
    }
  }

  private async cargar(
    tipo: TipoInformeNominaAccesorios,
    ano: number,
    mes: number,
    nitFiltro: string | null,
    fechaLabel: string,
  ): Promise<NominaAccesoriosResultadoEntity> {
    const vacio = {
      tipo,
      fechaLabel,
      emptyMessage: EMPTY_DEFAULT,
      auxiliar: [] as NominaAccesoriosAuxiliarEntity[],
      asesor: [] as NominaAccesoriosAsesorEntity[],
      tecnicos: [] as NominaAccesoriosTecnicoEntity[],
      otrasMarcas: [] as NominaAccesoriosOtrasMarcasEntity[],
      moInterna: [] as NominaAccesoriosMoInternaEntity[],
    };

    if (tipo === 1) {
      const rows = await this.repository.listarAuxiliar(ano, mes, nitFiltro);
      return new NominaAccesoriosResultadoEntity({
        ...vacio,
        auxiliar: rows.map(
          (row) =>
            new NominaAccesoriosAuxiliarEntity({
              fecha: fechaLabel,
              nombres: cellText(row, 'nombres'),
              ventaPropia: cellNumber(row, 'venta_propia'),
              ventaCompartida: cellNumber(row, 'venta_compartida'),
              comisionPropia:
                cellNumber(row, 'venta_propia') * PORC_COMISION_VENTA_PROPIA,
              comisionCompartida:
                cellNumber(row, 'venta_compartida') *
                PORC_COMISION_VENTA_COMPARTIDA,
              totalComision:
                cellNumber(row, 'venta_propia') * PORC_COMISION_VENTA_PROPIA +
                cellNumber(row, 'venta_compartida') *
                  PORC_COMISION_VENTA_COMPARTIDA,
            }),
        ),
      });
    }

    if (tipo === 2) {
      const rows = await this.repository.listarAsesor(ano, mes, nitFiltro);
      return new NominaAccesoriosResultadoEntity({
        ...vacio,
        asesor: rows
          .filter(
            (row) =>
              cellText(row, 'vendedor') !== NIT_ASESOR_ACCESORIOS_EXCLUIDO,
          )
          .map((row) => {
            const ventaPropia = cellNumber(row, 'venta_propia');
            const ventaCompartida = cellNumber(row, 'venta_compartida');
            const vhEntregados = cellNumber(row, 'vh_entregados');
            const comisionPropia = ventaPropia * PORC_COMISION_VENTA_PROPIA;
            const comisionCompartida =
              ventaCompartida * PORC_COMISION_VENTA_COMPARTIDA;
            return new NominaAccesoriosAsesorEntity({
              fecha: fechaLabel,
              documento: cellText(row, 'vendedor'),
              nombres: cellText(row, 'nombres'),
              ventaPropia,
              ventaCompartida,
              vhEntregados,
              comisionPropia,
              comisionCompartida,
              totalComision: comisionPropia + comisionCompartida,
              shareAccesorios:
                vhEntregados > 0
                  ? (ventaPropia + ventaCompartida) / vhEntregados
                  : null,
            });
          }),
      });
    }

    if (tipo === 3) {
      const rows = await this.repository.listarTecnicos(ano, mes, nitFiltro);
      return new NominaAccesoriosResultadoEntity({
        ...vacio,
        emptyMessage: nitFiltro
          ? `No hay registros de comisión para su cédula (${nitFiltro}) en ${fechaLabel}.`
          : EMPTY_DEFAULT,
        tecnicos: rows.map(
          (row) =>
            new NominaAccesoriosTecnicoEntity({
              fecha: fechaLabel,
              nombres: cellText(row, 'nombres'),
              totalHoras: cellNumber(row, 'Total_horas', 'total_horas'),
              comision: cellNumber(row, 'comision'),
            }),
        ),
      });
    }

    if (tipo === 4) {
      const rows = await this.repository.listarOtrasMarcas(ano, mes, nitFiltro);
      return new NominaAccesoriosResultadoEntity({
        ...vacio,
        otrasMarcas: rows.map(
          (row) =>
            new NominaAccesoriosOtrasMarcasEntity({
              fecha: fechaLabel,
              vendedor: cellText(row, 'vendedor'),
              ventaAccesorios: cellNumber(row, 'venta_accesorios'),
              comision: cellNumber(row, 'comision'),
            }),
        ),
      });
    }

    const rows = await this.repository.listarMoInterna(ano, mes);
    return new NominaAccesoriosResultadoEntity({
      ...vacio,
      moInterna: rows.map(
        (row) =>
          new NominaAccesoriosMoInternaEntity({
            fecha: fechaLabel,
            agencia: cellText(row, 'agencia'),
            tiempo: cellNumber(row, 'tiempo'),
            total: cellNumber(row, 'total'),
          }),
      ),
    });
  }
}
