import { InformeTiempoSuplementarioEntity } from './informe-tiempo-suplementario.entity';

export type SesionInformeHe = {
  nit: number;
  perfil: unknown;
};

export abstract class IInformeTiempoSuplementarioRepository {
  abstract listar(
    filtros:
      | {
          fecha_desde?: string;
          fecha_hasta?: string;
          sede?: string;
          area?: string;
          empleado?: string;
        }
      | undefined,
    sesion: SesionInformeHe,
  ): Promise<InformeTiempoSuplementarioEntity[]>;
}
