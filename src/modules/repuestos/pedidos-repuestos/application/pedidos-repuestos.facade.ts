import { Injectable } from '@nestjs/common';
import { PedidosRepuestosRepository } from '../infra/repositories/pedidos-repuestos.repository';

export type PedidoRepuestoItem = {
  numero: number;
  nitCliente: string;
  cliente: string;
  nitVendedor: string;
  vendedor: string;
  bodega: string;
  valorTotal: number;
  fechaHora: string | null;
};

@Injectable()
export class PedidosRepuestosFacade {
  constructor(private readonly repo: PedidosRepuestosRepository) {}

  async listar(q?: string): Promise<PedidoRepuestoItem[]> {
    const rows = await this.repo.listar(q?.trim() || undefined);
    return rows.map((row) => ({
      numero: Number(row.numero),
      nitCliente: row.nit ?? '',
      cliente: row.name_cliente ?? '',
      nitVendedor: row.vendedor ?? '',
      vendedor: row.name_vendedor ?? '',
      bodega: row.name_bodega ?? '',
      valorTotal: Number(row.valor_total ?? 0),
      fechaHora: toFechaHora(row.fecha_hora),
    }));
  }
}

function toFechaHora(value: Date | string | null): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}
