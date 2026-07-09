/** Perfiles administrador Contact Center (legacy auditoría / agendamiento admin) */
export const CC_PERFILES_ADMIN = [1, 20, 54] as const;

/** Perfil agente Contact Center */
export const CC_PERFIL_AGENTE = 31;

/** Perfil admin exclusivo agendamiento leads */
export const CC_PERFIL_ADMIN_LEADS = 1;

/** Agentes hardcodeados para asignación de leads */
export const CC_AGENTES_ASIGNACION_LEADS = [704, 830, 946, 931, 977] as const;

export function esAdminContactCenter(perfil: number): boolean {
  return (CC_PERFILES_ADMIN as readonly number[]).includes(perfil);
}

export function esAgenteContactCenter(perfil: number): boolean {
  return perfil === CC_PERFIL_AGENTE;
}

export function esAdminLeads(perfil: number): boolean {
  return perfil === CC_PERFIL_ADMIN_LEADS;
}
