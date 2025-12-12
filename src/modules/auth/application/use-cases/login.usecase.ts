// src/modules/auth/application/use-cases/login.usecase.ts
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../infra/auth.service';


@Injectable()
export class LoginUseCase {
    constructor(private readonly authService: AuthService) { }


    async execute(nit_usuario: number , password: string) {
        console.log('NIT USUARIO:', nit_usuario);
        console.log('PASSWORD:', password);
        const user = await this.authService.validateUser(nit_usuario, password);
        return this.authService.login(user);
    }
}