import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';

@Injectable()
export class ListarUsuariosGerenteCompraUseCase {
  constructor(private readonly repo: IGestionCompraRepository) {}

  execute() {
    return this.repo.listarUsuariosComboGerente();
  }
}
