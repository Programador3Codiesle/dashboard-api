import { Module } from '@nestjs/common';
import { FormatoDesempenoController } from './formato-desempeno.controller';
import { FormatoDesempenoFacade } from '../application/formato-desempeno.facade';
import { CrearFormatoDesempenoUseCase } from '../application/use-cases/crear-formato-desempeno.usecase';
import { ObtenerFormatoDesempenoUseCase } from '../application/use-cases/obtener-formato-desempeno.usecase';
import { IFormatoDesempenoRepository } from '../domain/formato-desempeno.repository';
import { FormatoDesempenoPrismaRepository } from './repositories/formato-desempeno.prisma.repository';

@Module({
  controllers: [FormatoDesempenoController],
  providers: [
    FormatoDesempenoFacade,
    CrearFormatoDesempenoUseCase,
    ObtenerFormatoDesempenoUseCase,
    {
      provide: IFormatoDesempenoRepository,
      useClass: FormatoDesempenoPrismaRepository,
    },
  ],
  exports: [FormatoDesempenoFacade],
})
export class FormatoDesempenoModule {}
