// src/modules/auth/infra/repositories/user.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';


@Injectable()
export class UserPrismaRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }


    async findByEmail(nit_usuario: number): Promise<User | null> {
        const u = await this.prisma.w_sist_usuarios.findFirst({ where: { nit_usuario: nit_usuario } });
        if (!u) return null;

        const tercero = await this.prisma.terceros.findUnique({
            where: { nit: nit_usuario },
            select: { nombres: true }
        });

        return new User(
            u.id_usuario?.toString() ?? String(u.id_usuario),
            Number(u.nit_usuario),
            u.pass ?? u.clave,
            u.perfil_postventa?.toString() ?? 'USER',
            undefined,
            tercero?.nombres
        );
    }


    async findById(id: string): Promise<User | null> {
        const results: any[] = await this.prisma.$queryRaw<any[]>`
            SELECT TOP 1
                u.id_usuario, 
                u.nit_usuario, 
                u.pass, 
                u.clave, 
                u.perfil_postventa, 
                t.refresh_token_hash
            FROM w_sist_usuarios u
            LEFT JOIN Tokens t ON t.id_usuario = u.id_usuario
            WHERE u.id_usuario = ${Number(id)}
            ORDER BY t.id DESC
        `;
        
        const u = results[0];
        if (!u) return null;
        return new User(
            u.id_usuario?.toString() ?? String(u.id_usuario),
            Number(u.nit_usuario),
            u.pass ?? u.clave ?? '',
            u.perfil_postventa?.toString() ?? 'USER',
            u.refresh_token_hash || undefined
        );
    }


    async create(userLike: Partial<User> & { passwordHash: string }): Promise<User> {
        if (!userLike.nit_usuario) {
            throw new Error('Email (NIT) is required for user creation');
        }

        const created = await this.prisma.w_sist_usuarios.create({
            data: {
                nit_usuario: Number(userLike.nit_usuario),
                clave: userLike.passwordHash.slice(0, 32),
                pass: userLike.passwordHash,
                perfil_postventa: userLike.perfil_postventa && userLike.perfil_postventa !== 'USER' ? Number(userLike.perfil_postventa) : undefined,
                // rol: userLike.role ?? 'USER',
                tipo_tercero: 1,
                fid_perfil: 1,
            },
        });


        return new User(created.id_usuario?.toString() ?? String(created.id_usuario), Number(created.nit_usuario), created.pass ?? created.clave ?? '', created.perfil_postventa?.toString() ?? 'USER');
    }


    async updateRefreshToken(id: string, refreshTokenHash: string | null): Promise<void> {
        try {
            // Eliminar tokens anteriores del usuario
            await this.prisma.$executeRaw`
                DELETE FROM Tokens WHERE id_usuario = ${Number(id)}
            `;

            if (refreshTokenHash) {
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await this.prisma.$executeRaw`
                    INSERT INTO Tokens (id_usuario, refresh_token_hash, expires_at) 
                    VALUES (${Number(id)}, ${refreshTokenHash}, ${expiresAt})
                `;
            }
        } catch (error: any) {
            // Si la tabla no existe, solo registramos el error pero no fallamos
            if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
                console.warn('La tabla Tokens no existe en la base de datos. Por favor, ejecuta la migración de Prisma para crearla.');
                return;
            }
            throw error;
        }
    }
}