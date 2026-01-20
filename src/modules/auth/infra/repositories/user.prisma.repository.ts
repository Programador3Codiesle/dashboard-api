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
        try {
            const u = await this.prisma.w_sist_usuarios.findUnique({
                where: { id_usuario: Number(id) },
                include: { refreshTokens: true },
            });
            if (!u) return null;
            return new User(u.id_usuario?.toString() ?? String(u.id_usuario), Number(u.nit_usuario), u.pass ?? u.clave ?? '', u.perfil_postventa?.toString() ?? 'USER', u.refreshTokens?.[0]?.refresh_token_hash);
        } catch (error: any) {
            // Si la tabla Tokens no existe, intentamos obtener el usuario sin la relación
            if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
                const u = await this.prisma.w_sist_usuarios.findUnique({
                    where: { id_usuario: Number(id) },
                });
                if (!u) return null;
                return new User(u.id_usuario?.toString() ?? String(u.id_usuario), Number(u.nit_usuario), u.pass ?? u.clave ?? '', u.perfil_postventa?.toString() ?? 'USER', undefined);
            }
            throw error;
        }
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
        } catch (error: any) {
            // Si la tabla no existe, solo registramos el error pero no fallamos
            // Esto permite que la aplicación funcione mientras se crea la tabla
            if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
                console.warn('La tabla Tokens no existe en la base de datos. Por favor, ejecuta la migración de Prisma para crearla.');
                // No lanzamos el error para que la aplicación pueda continuar funcionando
                // pero los refresh tokens no se guardarán hasta que se cree la tabla
                return;
            }
            // Si es otro tipo de error, lo lanzamos normalmente
            throw error;
        }
    }
}