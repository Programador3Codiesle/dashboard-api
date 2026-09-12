import { Inject, Injectable } from '@nestjs/common';
import type { MiPerfil } from '../../domain/mi-perfil';
import { IMiPerfilRepository } from '../../domain/repositories/mi-perfil.repository';

const TALLAS_VACIAS = {
  talla_camisa: null,
  talla_pantalon: null,
  talla_botas: null,
};

@Injectable()
export class GetMiPerfilUseCase {
  constructor(
    @Inject(IMiPerfilRepository)
    private readonly repo: IMiPerfilRepository,
  ) {}

  async execute(nit: number): Promise<MiPerfil> {
    const [usuario, horario, tallas, jefes] = await Promise.all([
      this.repo.findUsuarioByNit(nit),
      this.repo.findHorarioByNit(nit),
      this.repo.findTallasByNit(nit),
      this.repo.findJefesByNit(nit),
    ]);

    return {
      nombres: usuario?.nombres ?? null,
      nom_perfil: usuario?.nom_perfil ?? null,
      nit: usuario?.nit ?? String(nit),
      mail: usuario?.mail ?? null,
      telefono_1: usuario?.telefono_1 ?? null,
      telefono_2: usuario?.telefono_2 ?? null,
      sede: horario?.sede ?? null,
      tallas: tallas ?? TALLAS_VACIAS,
      jefes,
      horario,
    };
  }
}
