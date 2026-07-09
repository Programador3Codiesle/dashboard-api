import { RelacionMargenMaterialColoristaEntity } from './relacion-margen-materiales-colorista.entity';

export interface FiltrosRelacionMargenMaterialesColorista {
  ano: number;
  mes: number;
  bodegas: number[];
}

export abstract class IRelacionMargenMaterialesColoristaRepository {
  abstract listar(
    filtros: FiltrosRelacionMargenMaterialesColorista,
  ): Promise<RelacionMargenMaterialColoristaEntity[]>;
}
