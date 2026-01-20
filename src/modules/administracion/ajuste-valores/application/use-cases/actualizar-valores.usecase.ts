import { Injectable } from '@nestjs/common';
import { IAjusteValoresRepository } from '../../domain/ajuste-valores.repository';
import { UpdateAjusteValoresDto } from '../dto/update-ajuste-valores.dto';

@Injectable()
export class ActualizarValoresUseCase {
    constructor(private readonly repo: IAjusteValoresRepository) {}

    async execute(numero: number, tipo: string, dto: UpdateAjusteValoresDto) {
        return this.repo.actualizarValores(numero, tipo, dto);
    }
}
