import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { AgregarEmpresasResponseDto, AssignEmpresaDto } from "../../application/dto/assign-empresa.dto";
import { IUsuarioEmpresaRepository } from "../../domain/repositories/usuario-empresa.repository";
import { IUsuarioCoreRepository } from "../../domain/repositories/usuario-core.repository";

/**
 * Use Case para gestión de Empresas
 * Depende de las interfaces IUsuarioEmpresaRepository e IUsuarioCoreRepository (DIP)
 */
@Injectable()
export class AssignEmpresaUseCase {
  constructor(
    @Inject(IUsuarioEmpresaRepository)
    private readonly empresaRepo: IUsuarioEmpresaRepository,
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async execute(cedulaUsuario: string, nuevasEmpresasIds: string[]): Promise<AgregarEmpresasResponseDto> {
    // Validar que las empresas existen
    await this.validarEmpresasExisten(nuevasEmpresasIds);

    // Obtener empresas ACTUALES del usuario
    const empresasActuales = await this.empresaRepo.findEmpresasByUsuario(cedulaUsuario);

    // Filtra cualquier objeto donde la propiedad sea null o undefined
    const idsActuales = empresasActuales
      .filter(e => e.id_empresa != null)
      .map(e => e.id_empresa.toString());

    // Filtrar solo las NUEVAS (que no tiene)
    const empresasParaAgregar = nuevasEmpresasIds.filter(
      id => !idsActuales.includes(id)
    );

    // Si no hay nuevas, retornar mensaje
    if (empresasParaAgregar.length === 0) {
      return {
        success: true,
        message: 'El usuario ya tiene todas las empresas solicitadas',
        cedula: cedulaUsuario,
        empresasActuales: idsActuales,
        empresasSolicitadas: nuevasEmpresasIds,
        empresasAgregadas: [],
        empresasQueYaTenía: idsActuales.filter(id => nuevasEmpresasIds.includes(id)),
        totalEmpresas: idsActuales.length,
      };
    }

    // Usar transacción para atomicidad
    const empresasRealmenteAgregadas = await this.coreRepo.transaction(async () => {
      return this.empresaRepo.addEmpresasSafe(cedulaUsuario, empresasParaAgregar);
    });

    // Retornar resultado
    return {
      success: true,
      message: empresasRealmenteAgregadas.length > 0 
        ? `Se agregaron ${empresasRealmenteAgregadas.length} nuevas empresas`
        : 'No se agregaron nuevas empresas (posible duplicado)',
      cedula: cedulaUsuario,
      empresasActuales: [...idsActuales, ...empresasRealmenteAgregadas],
      empresasSolicitadas: nuevasEmpresasIds,
      empresasAgregadas: empresasRealmenteAgregadas,
      empresasQueYaTenía: idsActuales.filter(id => nuevasEmpresasIds.includes(id)),
      totalEmpresas: idsActuales.length + empresasRealmenteAgregadas.length,
    };
  }

  private async validarEmpresasExisten(empresasIds: string[]) {
    for (const empresaId of empresasIds) {
      const existe = await this.empresaRepo.existsEmpresa(empresaId);
      if (!existe) {
        throw new BadRequestException(`Empresa ${empresaId} no existe`);
      }
    }
  }

  async eliminarEmpresa(idUsuario: number, dto: AssignEmpresaDto) {
    return this.empresaRepo.eliminarEmpresa(idUsuario, dto);
  }
}
