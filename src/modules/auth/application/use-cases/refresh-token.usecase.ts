// src/modules/auth/application/use-cases/refresh-token.usecase.ts
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../infra/auth.service';


@Injectable()
export class RefreshTokenUseCase {
    constructor(private readonly authService: AuthService) { }


    async execute(userId: string, refreshToken: string) {
        return this.authService.refreshToken(userId, refreshToken);
    }
}