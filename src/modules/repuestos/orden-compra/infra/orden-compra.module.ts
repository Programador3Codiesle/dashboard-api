import { Module } from '@nestjs/common';
import { OrdenCompraFacade } from '../application/orden-compra.facade';
import { OrdenCompraController } from './orden-compra.controller';
import { OrdenCompraRepository } from './repositories/orden-compra.repository';

@Module({
  controllers: [OrdenCompraController],
  providers: [OrdenCompraRepository, OrdenCompraFacade],
})
export class OrdenCompraModule {}
