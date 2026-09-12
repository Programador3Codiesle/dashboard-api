import { Injectable } from '@nestjs/common';
import { AuthService } from '../../infra/auth.service';
import { LoginDto } from '../../application/dto/login.dto';

export type LoginExecuteResult =
  | {
      mustChangePassword: true;
      userId: string;
      changeToken: string;
    }
  | {
      mustChangePassword?: false;
      user: Awaited<ReturnType<AuthService['login']>>['user'];
      accessToken: string;
      refreshToken: string;
    };

@Injectable()
export class LoginUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(dto: LoginDto, clientIp?: string): Promise<LoginExecuteResult> {
    const result = await this.authService.validateUser(
      dto.nit_usuario,
      dto.password,
      clientIp,
    );
    if (result.status === 'must_change_password') {
      return {
        mustChangePassword: true,
        userId: result.userId,
        changeToken: this.authService.issuePasswordChangeToken(result.userId),
      };
    }
    const session = await this.authService.login(result.user);
    return { ...session, mustChangePassword: false };
  }
}
