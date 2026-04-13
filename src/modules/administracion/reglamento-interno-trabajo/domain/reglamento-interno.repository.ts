export abstract class IReglamentoInternoRepository {
  /**
   * Retorna la ruta relativa del archivo de reglamento interno de trabajo.
   * No accede a base de datos ya que el recurso es un PDF estático.
   */
  abstract obtenerRutaArchivo(): string;
}
