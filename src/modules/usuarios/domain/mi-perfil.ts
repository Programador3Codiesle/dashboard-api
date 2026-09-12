export type MiPerfilHorario = {
  sede: string | null;
  hora_ent_sem_am: string | null;
  hora_sal_sem_am: string | null;
  hora_ent_sem_pm: string | null;
  hora_sal_sem_pm: string | null;
  hora_ent_am_viernes: string | null;
  hora_sal_am_viernes: string | null;
  hora_ent_viernes_pm: string | null;
  hora_sal_viernes: string | null;
  hora_ent_fds: string | null;
  hora_sal_fds: string | null;
};

export type MiPerfilTallas = {
  talla_camisa: string | null;
  talla_pantalon: string | null;
  talla_botas: string | null;
};

export type MiPerfilJefe = {
  nombres: string;
  nom_perfil: string | null;
};

export type MiPerfil = {
  nombres: string | null;
  nom_perfil: string | null;
  nit: string | null;
  mail: string | null;
  telefono_1: string | null;
  telefono_2: string | null;
  sede: string | null;
  tallas: MiPerfilTallas;
  jefes: MiPerfilJefe[];
  horario: MiPerfilHorario | null;
};
