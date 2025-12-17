// src/modules/auth/application/use-cases/login.usecase.ts
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../infra/auth.service';
import { LoginDto } from '../../application/dto/login.dto';

@Injectable()
export class LoginUseCase {
    constructor(private readonly authService: AuthService) { }


    async execute(dto: LoginDto) {
        console.log('NIT USUARIO:', dto.nit_usuario);
        console.log('PASSWORD:', dto.password);
        const user = await this.authService.validateUser(dto.nit_usuario, dto.password);
        return this.authService.login(user);
    }
}