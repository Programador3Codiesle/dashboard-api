export function cumplimiento(venta: number, presupuesto: number): number {
  if (!venta) return 0;
  const den = presupuesto === 0 ? venta : presupuesto;
  return Math.round((venta / den) * 10000) / 100;
}
