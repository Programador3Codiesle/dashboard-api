// src/modules/auth/application/use-cases/register.usecase.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as userRepository from '../../domain/user.repository';
import * as bcrypt from 'bcrypt';


@Injectable()
export class RegisterUseCase {
    constructor(private readonly userRepo: userRepository.IUserRepository) { }


    async execute(data: { email: number; password: string; name?: string }) {
        const exists = await this.userRepo.findByEmail(data.email);
        if (exists) throw new BadRequestException('Usuario ya existe');


        const passwordHash = await bcrypt.hash(data.password, 10);
        const created = await this.userRepo.create({
            nit_usuario: data.email,
            clave: passwordHash,
            perfil_postventa: 'USER', // Default role
        } as any);


        return { id: created.id, nit_usuario: created.nit_usuario };
    }
}