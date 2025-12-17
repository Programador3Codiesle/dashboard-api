import { Injectable } from "@nestjs/common";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { AgregarEmpresasResponseDto } from "../../application/dto/assign-empresa.dto";
import { AssignEmpresaDto } from "../../application/dto/assign-empresa.dto";

@Injectable()
export class AssignEmpresaUseCase {
  constructor(private usuarioRepo: IUsuarioRepository) {}

  async execute(cedulaUsuario: string, nuevasEmpresasIds: string[]): Promise<AgregarEmpresasResponseDto> {
    
    // 2. Validar que las empresas existen
    await this.validarEmpresasExisten(nuevasEmpresasIds);

    // 3. Obtener empresas ACTUALES del usuario
    const empresasActuales = await this.usuarioRepo.findEmpresasByUsuario(cedulaUsuario);

   // Filtra cualquier objeto donde la propiedad sea null o undefined
  const idsActuales = empresasActuales
    .filter(e => e.id_empresa != null) // Usamos != null para capturar null y undefined
    .map(e => e.id_empresa.toString());

    // 4. Filtrar solo las NUEVAS (que no tiene)
    const empresasParaAgregar = nuevasEmpresasIds.filter(
      id => !idsActuales.includes(id)
    );

    // 5. Si no hay nuevas, retornar mensaje
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

    // 6. ✅ Usar transacción para atomicidad
    const empresasRealmenteAgregadas = await this.usuarioRepo.transaction(async () => {
      return this.usuarioRepo.addEmpresasSafe(cedulaUsuario, empresasParaAgregar);
    });

    // 7. Retornar resultado
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
      const existe = await this.usuarioRepo.existsEmpresa(empresaId);
      if (!existe) {
        throw new BadRequestException(`Empresa ${empresaId} no existe`);
      }
    }
  }

  async eliminarEmpresa(idUsuario: number, dto: AssignEmpresaDto) {
    return this.usuarioRepo.eliminarEmpresa(idUsuario, dto);
  }



}