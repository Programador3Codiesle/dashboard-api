import { Module } from '@nestjs/common';
import { FormatosNominaController } from './formatos-nomina.controller';
import { FormatosNominaFacade } from '../application/formatos-nomina.facade';
import { ObtenerFormatosUseCase } from '../application/use-cases/obtener-formatos.usecase';
import { IFormatoNominaRepository } from '../domain/formato-nomina.repository';
import { FormatoNominaStaticRepository } from './repositories/formato-nomina.static.repository';

@Module({
  controllers: [FormatosNominaController],
  providers: [
    FormatosNominaFacade,
    ObtenerFormatosUseCase,
    {
      provide: IFormatoNominaRepository,
      useClass: FormatoNominaStaticRepository,
    },
  ],
  exports: [FormatosNominaFacade],
})
export class FormatosNominaModule {}
