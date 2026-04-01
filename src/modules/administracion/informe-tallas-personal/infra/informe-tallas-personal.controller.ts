import { Controller, Get } from '@nestjs/common';
import { TallasPersonalFacade } from '../application/tallas-personal.facade';

@Controller('informe-tallas-personal')
export class InformeTallasPersonalController {
  constructor(private readonly facade: TallasPersonalFacade) {}

  @Get()
  listar() {
    return this.facade.listar();
  }
}

