import { Injectable } from '@nestjs/common';
import { IMpcRepository } from '../../domain/mpc.repository';
import { MpcInformeRowEntity } from '../../domain/mpc.entity';

@Injectable()
export class ListarMpcUseCase {
  constructor(private readonly repo: IMpcRepository) {}

  execute(): Promise<MpcInformeRowEntity[]> {
    return this.repo.listar();
  }
}

