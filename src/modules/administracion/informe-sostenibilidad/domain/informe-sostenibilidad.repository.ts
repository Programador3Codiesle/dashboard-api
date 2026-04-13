export abstract class IInformeSostenibilidadRepository {
  /**
   * Retorna la ruta relativa del archivo de informe de sostenibilidad.
   * No accede a base de datos ya que el recurso es un PDF estático.
   */
  abstract obtenerRutaArchivo(): string;
}
