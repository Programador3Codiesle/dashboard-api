import { Module } from '@nestjs/common';
import { ReglamentoInternoController } from './reglamento-interno.controller';
import { ReglamentoInternoFacade } from '../application/reglamento-interno.facade';
import { IReglamentoInternoRepository } from '../domain/reglamento-interno.repository';
import { ReglamentoInternoTrabajoRepository } from './repositories/reglamiento-interno-trabajo.repository';

@Module({
    controllers: [ReglamentoInternoController],
    providers: [
        ReglamentoInternoFacade,
        { provide: IReglamentoInternoRepository, useClass: ReglamentoInternoTrabajoRepository },
    ],
    exports: [ReglamentoInternoFacade],
})
export class ReglamentoInternoModule { }
