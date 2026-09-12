import type {
  MiPerfilHorario,
  MiPerfilJefe,
  MiPerfilTallas,
} from '../mi-perfil';

export type MiPerfilUsuarioRow = {
  nombres: string | null;
  nom_perfil: string | null;
  nit: string | null;
  mail: string | null;
  telefono_1: string | null;
  telefono_2: string | null;
};

export abstract class IMiPerfilRepository {
  abstract findUsuarioByNit(nit: number): Promise<MiPerfilUsuarioRow | null>;
  abstract findHorarioByNit(nit: number): Promise<MiPerfilHorario | null>;
  abstract findTallasByNit(nit: number): Promise<MiPerfilTallas | null>;
  abstract findJefesByNit(nit: number): Promise<MiPerfilJefe[]>;
}
