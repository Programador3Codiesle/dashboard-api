import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { RelacionMargenMaterialesColoristaController } from './relacion-margen-materiales-colorista.controller';
import { IRelacionMargenMaterialesColoristaRepository } from '../domain/relacion-margen-materiales-colorista.repository';
import { RelacionMargenMaterialesColoristaPrismaRepository } from './repositories/relacion-margen-materiales-colorista.prisma.repository';
import { ListarRelacionMargenMaterialesColoristaUseCase } from '../application/use-cases/listar-relacion-margen-materiales-colorista.usecase';
import { RelacionMargenMaterialesColoristaFacade } from '../application/relacion-margen-materiales-colorista.facade';

@Module({
  imports: [PrismaModule],
  controllers: [RelacionMargenMaterialesColoristaController],
  providers: [
    {
      provide: IRelacionMargenMaterialesColoristaRepository,
      useClass: RelacionMargenMaterialesColoristaPrismaRepository,
    },
    ListarRelacionMargenMaterialesColoristaUseCase,
    RelacionMargenMaterialesColoristaFacade,
  ],
})
export class RelacionMargenMaterialesColoristaModule {}
