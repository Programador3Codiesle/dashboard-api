import { Module } from '@nestjs/common';
import { FormatosNominaController } from './formatos-nomina.controller';
import { FormatosNominaFacade } from '../application/formatos-nomina.facade';
import { ObtenerFormatosUseCase } from '../application/use-cases/obtener-formatos.usecase';
import { IFormatoNominaRepository } from '../domain/formato-nomina.repository';
import { FormatoNominaPrismaRepository } from './repositories/formato-nomina.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
    controllers: [FormatosNominaController],
    providers: [
        FormatosNominaFacade,
        ObtenerFormatosUseCase,
        { provide: IFormatoNominaRepository, useClass: FormatoNominaPrismaRepository },
        PrismaService
    ],
    exports: [FormatosNominaFacade]
})
export class FormatosNominaModule { }
