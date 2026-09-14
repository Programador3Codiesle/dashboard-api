/** Tickets.php: perfil_postventa 1, 20, 62, 25–29 ven Activos/Finalizados. */
export const PERFILES_STAFF_TICKETS = [1, 20, 62, 25, 26, 27, 28, 29] as const;

export function esPerfilStaffTickets(perfil: unknown): boolean {
  const n = Number(perfil);
  return (
    Number.isFinite(n) &&
    (PERFILES_STAFF_TICKETS as readonly number[]).includes(n)
  );
}
