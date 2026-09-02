import { ValidacionBonosJefeEntity } from '../../domain/comisiones-jefes.entity';

export function toCheckValoresHttpResponse(result: {
  data: ValidacionBonosJefeEntity[];
  bonoMatriz: Record<string, string | number> | null;
}) {
  return {
    status: result.data.length > 0,
    title: result.data.length > 0 ? 'Exito' : 'Advertencia',
    icon: result.data.length > 0 ? 'success' : 'warning',
    message:
      result.data.length > 0
        ? 'Cargando la información de los bonos.'
        : 'No se ha encontrado información en la base de datos, con los campos seleccionados.',
    data: result.data,
    bono: result.bonoMatriz ? [result.bonoMatriz] : null,
  };
}

export function toActualizarValoresHttpResponse(result: {
  updated: boolean;
  message: string;
}) {
  return {
    status: result.updated,
    title: result.updated ? 'Exito' : 'Error',
    icon: result.updated ? 'success' : 'error',
    message: result.message,
  };
}
