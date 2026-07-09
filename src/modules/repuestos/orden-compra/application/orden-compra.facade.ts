import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { puedeAutorizarOrdenCompra } from '../../shared/domain/ev-permisos';
import {
  AccionOrdenCompraDto,
  GuardarPresupuestoOcDto,
  ListarOrdenCompraDto,
} from './dto/orden-compra.dto';
import { OrdenCompraRepository } from '../infra/repositories/orden-compra.repository';

@Injectable()
export class OrdenCompraFacade {
  constructor(private readonly repo: OrdenCompraRepository) {}

  async listar(dto: ListarOrdenCompraDto, perfil: number) {
    const rows = await this.repo.listar(dto.fechaIni, dto.fechaFin);
    const now = new Date();
    const presupuestoMes = await this.repo.obtenerPresupuestoMes(
      now.getFullYear(),
      now.getMonth() + 1,
    );

    let costoTotalAutorizado = 0;
    const puedeAuth = puedeAutorizarOrdenCompra(perfil);

    const items = rows.map((row) => {
      const denegado = row.estado === 1;
      if (!denegado) costoTotalAutorizado += Number(row.costo_total ?? 0);

      return {
        numeroOc: row.numero_oc,
        bodega: row.bodega,
        fechaOc: row.fecha_oc,
        notas: row.notas,
        codigo: row.codigo,
        repuesto: row.repuesto,
        cantidad: Number(row.cantidad),
        costoUnitario: Number(row.costo_unitario),
        costoTotal: Number(row.costo_total),
        tipo: row.tipo,
        vendedor: row.vendedor,
        ultimaCompra: row.ultima_compra,
        ultimaVenta: row.ultima_venta,
        autorizacionCantidad: row.autorizacion_cantidad,
        autorizacionCostoTotal: row.autorizacion_costo_total,
        autorizacionCostoUnitario: row.autorizacion_costo_unitario,
        autorizacionDisponibilidad: row.autorizacion_disponibilidad,
        autorizacionMovimiento: row.autorizacion_movimiento,
        giron: Number(row.giron),
        chevropartes: Number(row.chevropartes),
        barranca: Number(row.barranca),
        rosita: Number(row.rosita),
        villa: Number(row.villa),
        solochevrolet: Number(row.solochevrolet),
        stockSeguridad: Number(row.stock_seguridad),
        denegado,
        puedeAutorizar: puedeAuth,
        autorizadoLabel: denegado ? 'NO' : 'SI',
      };
    });

    return {
      items,
      presupuesto: presupuestoMes?.presupuesto ?? 0,
      compras: presupuestoMes?.compras ?? 0,
      costoTotalAutorizado,
    };
  }

  async autorizar(dto: AccionOrdenCompraDto, perfil: number) {
    if (!puedeAutorizarOrdenCompra(perfil)) {
      throw new ForbiddenException('No tiene permisos para autorizar');
    }
    const count = await this.repo.autorizar(
      dto.items.map((i) => ({ numeroOc: i.numeroOc, codigo: i.codigo })),
    );
    return { autorizados: count };
  }

  async denegar(dto: AccionOrdenCompraDto, userId: number, perfil: number) {
    if (!puedeAutorizarOrdenCompra(perfil)) {
      throw new ForbiddenException('No tiene permisos para denegar');
    }
    const count = await this.repo.denegar(
      dto.items.map((i) => ({ numeroOc: i.numeroOc, codigo: i.codigo })),
      userId,
    );
    return { denegados: count };
  }

  async guardarPresupuesto(
    dto: GuardarPresupuestoOcDto,
    userId: number,
    perfil: number,
  ) {
    if (!puedeAutorizarOrdenCompra(perfil)) {
      throw new ForbiddenException(
        'No tiene permisos para guardar presupuesto',
      );
    }
    const [anio, mes] = dto.fechaMes.split('-').map(Number);
    if (!anio || !mes) {
      throw new BadRequestException('Fecha de presupuesto inválida');
    }
    if (dto.presupuesto == null && dto.compras == null) {
      throw new BadRequestException('Debe indicar presupuesto y/o compras');
    }
    await this.repo.guardarPresupuesto({
      anio,
      mes,
      userId,
      presupuesto: dto.presupuesto,
      compras: dto.compras,
    });
    return { message: 'Presupuesto guardado' };
  }
}
