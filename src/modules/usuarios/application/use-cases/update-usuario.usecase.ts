import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { UpdateUsuarioDto } from "../dto/update-usuario.dto";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";

@Injectable()
export class UpdateUsuarioUseCase {
    constructor(private readonly repo: IUsuarioRepository) { }

    async actualizarUsuario(id: number, dto: UpdateUsuarioDto) {

        // ✅ Mapear el DTO de entrada a la estructura de BD
        const mappedData = UsuarioMapper.mapUpdateUsuarioDto(dto);


        const usuario = await this.repo.updateUsuario(id, mappedData);
   
        return usuario;

    }

    /** Listar perfiles */
    async listarPerfiles() {
        return this.repo.listarPerfiles();
    }

    /** Listar perfil del usuario */
    async listarPerfilUsuario(id: number) {
        return this.repo.listarPerfilUsuario(id);
    }

    /** Reset contraseña */
    async resetPassword(id: number | string, dto: UpdateUsuarioDto) {
        const _id = typeof id === 'string' ? Number(id) : id;

        // La contraseña a encriptar es el NIT que viene en el DTO (o el ID si no viene NIT, según requerimiento "siempre va llegar una cedula")
        // Asumimos que dto.nit trae la cedula/contraseña.
        const passwordRaw = dto.nit ? String(dto.nit) : String(id);

        const encryptedPassword = this.encryptLegacyPassword(passwordRaw);

        return this.repo.resetPassword(_id, encryptedPassword);
    }

    public encryptLegacyPassword(text: string): string {
        try {
            const encryptionKey = Buffer.from('deed168c00e0ef596a84311013083fea', 'utf8');
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
            let encrypted = cipher.update(text, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            const ivBase64 = iv.toString('base64');
            const combined = `${encrypted}::${ivBase64}`;

            return Buffer.from(combined, 'utf8').toString('base64');
        } catch (err) {
            console.error('Error encriptando clave legacy:', err);
            throw new Error('Error al encriptar contraseña');
        }
    }

    /** Deshabilitar usuario */
    async deshabilitar(id: number) {
        return this.repo.deshabilitar(id);
    }

    /** Habilitar usuario */
    async habilitar(id: number) {
        return this.repo.habilitar(id);
    }
}
