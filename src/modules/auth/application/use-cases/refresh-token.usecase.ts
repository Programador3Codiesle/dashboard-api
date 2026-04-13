import { Injectable } from '@nestjs/common';
import { AuthService } from '../../infra/auth.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(userId: string | null | undefined, refreshToken: string) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
