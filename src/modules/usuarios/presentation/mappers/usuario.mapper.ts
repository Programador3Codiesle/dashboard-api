import { UsuarioEntity } from "../../domain/usuario.entity";
import { UsuarioPresenter } from "../presenters/usuario.presenter";
import { w_sist_usuarios } from "@prisma/client";
import { GetUsuariosResponseDto } from "../../application/dto/get-usuarios-response.dto";
import { AssignEmpresaUseCase } from "../../application/use-cases/assign-empresa.usecase";

export class UsuarioMapper {

    // ✅ MAPPER actualizado con campos de JOINs
    static toUsuariosResponse(entity: UsuarioEntity): GetUsuariosResponseDto {
        const empresasArray = this.extraerEmpresasArray(entity.empresa);
        const empresasFormateadas = this.formatearEmpresas(empresasArray);
        return {
            // Campos básicos (ya tenías)
            id: entity.id,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            // ✅ NUEVOS campos de los JOINs
            nombresCompletos: entity.nombresCompletos || '',  // De terceros.nombres
            nit: entity.nit || '',                            // De w_sist_usuarios.nit_usuario
            perfil: entity.perfil || '',                      // De postv_perfiles.nom_perfil
            estado: entity.estado || '',                      // De w_sist_usuarios.estado_usuario
            sede: entity.sede || '',                          // De postv_horarios_empleados.sede
            // ✅ Para empresas
            empresa: entity.empresa || '', // String original: "1,2,3"
            empresaFormateada: empresasFormateadas, // "CODIESEL, DIESELCO, MITSUBISHI"
            empresasArray: empresasArray, // ["1", "2", "3"]
            empresasNombresArray: this.mapearEmpresasNombres(empresasArray),
            // Campos formateados/calculados (opcional)
            estadoDisplay: this.formatearEstado(entity.estado),
            fechaCreacionFormateada: this.formatearFecha(entity.createdAt),
            tieneSede: !!entity.sede,
            tieneEmpresa: !!entity.empresa,
        };
    }

    // ✅ Para lista de entidades
    static toUsuariosResponseList(entities: UsuarioEntity[]): GetUsuariosResponseDto[] {
        return entities.map(e => this.toUsuariosResponse(e));
    }


    // ✅ Helper para formatear estado
    private static formatearEstado(estado?: string): string {
        if (!estado) return 'DESCONOCIDO';

        const estados: Record<string, string> = {
            'A': 'ACTIVO',
            'I': 'INACTIVO',
            '1': 'ACTIVO',
            '0': 'INACTIVO',
            'ACTIVO': 'ACTIVO',
            'INACTIVO': 'INACTIVO',
        };

        return estados[estado.toUpperCase()] || estado;
    }

// ✅ Extrae string "1,2,3" → array ["1", "2", "3"]
private static extraerEmpresasArray(empresa?: string): string[] {
    if (!empresa) return [];
    
    return empresa
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
}


// ✅ Mapea IDs a nombres
private static mapearEmpresasNombres(ids: string[]): string[] {
    const empresasMap: Record<string, string> = {
        '1': 'CODIESEL',
        '2': 'DIESELCO',
        '3': 'MITSUBISHI',
        '4': 'BYD'
    };
    
    return ids.map(id => empresasMap[id] || `Empresa ${id}`);
}



private static formatearEmpresas(ids: string[]): string {
    if (ids.length === 0) return 'SIN EMPRESA';
    
    const nombres = this.mapearEmpresasNombres(ids);
    
    if (nombres.length === 1) {
        return nombres[0];
    }
    
    // Para múltiples: "CODIESEL, DIESELCO y MITSUBISHI"
    if (nombres.length === 2) {
        return `${nombres[0]} y ${nombres[1]}`;
    }
    
    // Para 3 o más: "CODIESEL, DIESELCO y MITSUBISHI"
    const todosMenosUltimo = nombres.slice(0, -1).join(', ');
    const ultimo = nombres[nombres.length - 1];
    return `${todosMenosUltimo} y ${ultimo}`;
}


    // ✅ Helper para formatear fecha
    private static formatearFecha(fecha?: Date | string): string {
        if (!fecha) return '';

        const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }


    static toDomain(data: w_sist_usuarios): UsuarioEntity {
        return new UsuarioEntity({
            id: data.id_usuario.toString(),
            nombre: data.usuario || '',
            email: '', // w_sist_usuarios table does not have an email column
            telefono: '', // w_sist_usuarios table does not have a phone column
            rol: data.fid_perfil.toString(),
            createdAt: data.fecha_hora_crea_usu ?? undefined,
            updatedAt: data.fecha_hora_mod_usu ?? undefined,
        });
    }

    // ✅ Para datos con JOINs (Raw Query)
    static toDomainWithJoins(row: any): UsuarioEntity {
        return new UsuarioEntity({
            id: row.id_usuario.toString(),
            nombre: row.usuario || '',
            nombresCompletos: row.nombres || '',      // De terceros
            nit: row.nit || '',                       // De w_sist_usuarios
            perfil: row.nom_perfil || '',             // De postv_perfiles
            estado: row.estado || '',                 // Convertido en SQL
            sede: row.sede || '',                     // De postv_horarios_empleados
            empresa: row.idEmpresas || '',            // De sw_empresa_usuario
            email: '',
            telefono: '',
            rol: '', // No viene en el SELECT
            createdAt: row.fecha_hora_crea_usu ? new Date(row.fecha_hora_crea_usu) : undefined,
            updatedAt: row.fecha_hora_mod_usu ? new Date(row.fecha_hora_mod_usu) : undefined,
        });
    }


    static toPresenter(entity: UsuarioEntity): UsuarioPresenter {
        return new UsuarioPresenter({
            id: entity.id,
            nombre: entity.nombre,
            email: entity.email,
            telefono: entity.telefono,
            rol: entity.rol,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static toPresenterList(entities: UsuarioEntity[]) {
        return entities.map((e) => UsuarioMapper.toPresenter(e));
    }


 


}
