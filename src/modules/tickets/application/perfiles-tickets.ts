/** Solo perfiles 1 y 20 ven Activos y Finalizados. El resto queda en Mis tickets. */
export const PERFILES_STAFF_TICKETS = [1, 20] as const;

export function esPerfilStaffTickets(perfil: unknown): boolean {
  const n = Number(perfil);
  return (
    Number.isFinite(n) &&
    (PERFILES_STAFF_TICKETS as readonly number[]).includes(n)
  );
}
