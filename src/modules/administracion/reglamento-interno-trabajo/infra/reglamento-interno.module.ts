import { Module } from '@nestjs/common';
import { ReglamentoInternoController } from './reglamento-interno.controller';
import { ReglamentoInternoFacade } from '../application/reglamento-interno.facade';

@Module({
    controllers: [ReglamentoInternoController],
    providers: [ReglamentoInternoFacade],
    exports: [ReglamentoInternoFacade]
})
export class ReglamentoInternoModule { }
