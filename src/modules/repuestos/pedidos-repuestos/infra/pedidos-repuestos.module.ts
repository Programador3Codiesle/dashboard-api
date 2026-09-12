import { Module } from '@nestjs/common';
import { PedidosRepuestosFacade } from '../application/pedidos-repuestos.facade';
import { PedidosRepuestosController } from './pedidos-repuestos.controller';
import { PedidosRepuestosRepository } from './repositories/pedidos-repuestos.repository';

@Module({
  controllers: [PedidosRepuestosController],
  providers: [PedidosRepuestosRepository, PedidosRepuestosFacade],
})
export class PedidosRepuestosModule {}
