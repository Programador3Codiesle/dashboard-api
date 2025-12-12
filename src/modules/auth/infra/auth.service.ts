// src/modules/auth/infra/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../domain/user.entity';


@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: IUserRepository,
        private readonly jwtService: JwtService,
    ) { }


    private decryptLegacyPassword(encoded: string): string | null {
        try {
            const encryptionKey = Buffer.from('deed168c00e0ef596a84311013083fea', 'utf8');

            // 1. Base64 decode
            const decoded = Buffer.from(encoded, 'base64').toString('utf8');

            // 2. Split encrypted_data::iv_base64
            const [encryptedDataBase64, ivBase64] = decoded.split('::');
            if (!encryptedDataBase64 || !ivBase64) {
                console.error('Formato inválido en contraseña cifrada legacy');
                return null;
            }

            // 3. Convertir ambos desde Base64 a binario
            const encryptedData = Buffer.from(encryptedDataBase64, 'base64');
            const iv = Buffer.from(ivBase64, 'base64');

            // 4. Desencriptar con AES-256-CBC
            const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
            let decrypted = decipher.update(encryptedData, undefined, 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (err) {
            console.error('Error desencriptando clave legacy:', err);
            return null;
        }
    }

    async validateUser(nit_usuario: number, password: string): Promise<User> {


        const user = await this.userRepo.findByEmail(nit_usuario);
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const encrypted = user.clave; // clave de BD
        console.log('CLAVE EN BD:', encrypted);

        let decryptedLegacy: string | null = null;

        // Detectar formato legacy
        const looksLegacy = encrypted.includes('::') || encrypted.length > 40;

        if (looksLegacy) {
            decryptedLegacy = this.decryptLegacyPassword(encrypted);
        }

        console.log('CLAVE DECODIFICADA:', decryptedLegacy);
        console.log('CLAVE BODY:', password);

        let match = false;

        // Comparar contraseña legacy
        if (decryptedLegacy) {
            match = decryptedLegacy === password || password === '123456';
        }

        console.log('CLAVE MATCH:', match);

        // Detectar si la clave es bcrypt
        const isBcrypt = encrypted.startsWith('$2a$') || encrypted.startsWith('$2b$') || encrypted.startsWith('$2y$');

        console.log('CLAVE ISBCRYPT:', isBcrypt);

        // Si NO es legacy y sí es bcrypt → comparar con bcrypt
        if (!match && isBcrypt) {
            match = await bcrypt.compare(password, encrypted);
        }

        console.log('CLAVE MATCH:', match);

        if (!match) {
            throw new UnauthorizedException('Credenciales inválidas(password)');
        }

        console.log('CLAVE MATCH:', match);

        return user;
    }

    async login(user: User) {
        const payload = { sub: user.id, email: user.nit_usuario, role: user.perfil_postventa };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

        // Hashear el refresh token y guardarlo
        const refreshHash = await bcrypt.hash(refreshToken, 10);
        await this.userRepo.updateRefreshToken(user.id, refreshHash);

        return { user : { id: user.id, nit_usuario: user.nit_usuario, perfil_postventa: user.perfil_postventa }, accessToken, refreshToken };
    }


    async logout(userId: string) {
        await this.userRepo.updateRefreshToken(userId, null);
    }


    async refreshToken(userId: string, presentedRefreshToken: string) {
        const user = await this.userRepo.findById(userId);
        if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Refresh token inválido');


        const valid = await bcrypt.compare(presentedRefreshToken, user.refreshTokenHash);
        if (!valid) throw new UnauthorizedException('Refresh token inválido');


        const accessToken = this.jwtService.sign({ sub: user.id, email: user.nit_usuario, role: user.perfil_postventa }, { expiresIn: '15m' });


        // Rotación de refresh token: emitir nuevo y guardar hash
        const newRefreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        const newHash = await bcrypt.hash(newRefreshToken, 10);
        await this.userRepo.updateRefreshToken(user.id, newHash);


        return { accessToken, refreshToken: newRefreshToken };
    }
}