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
        const u = await this.prisma.w_sist_usuarios.findUnique({
            where: { id_usuario: Number(id) },
            include: { refreshTokens: true },
        });
        if (!u) return null;
        return new User(u.id_usuario?.toString() ?? String(u.id_usuario), Number(u.nit_usuario), u.pass ?? u.clave ?? '', u.perfil_postventa?.toString() ?? 'USER', u.refreshTokens?.[0]?.refresh_token_hash);
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
        await this.prisma.tokens.deleteMany({ where: { id_usuario: Number(id) } });

        if (refreshTokenHash) {
            await this.prisma.tokens.create({
                data: {
                    id_usuario: Number(id),
                    refresh_token_hash: refreshTokenHash,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        }
    }
}