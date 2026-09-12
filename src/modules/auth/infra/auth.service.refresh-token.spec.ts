import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('new-hash'),
  compare: jest.fn(),
}));

const compareMock = bcrypt.compare as jest.MockedFunction<
  typeof bcrypt.compare
>;

function mockRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findEmpresasByNit: jest.fn().mockResolvedValue([]),
    findMenusByPerfil: jest.fn().mockResolvedValue([]),
    findSubmenusByPerfil: jest.fn().mockResolvedValue([]),
    findTrimenusByPerfil: jest.fn().mockResolvedValue([]),
    findNombrePerfilById: jest.fn().mockResolvedValue(null),
    ensureEmpresaCodiesel: jest.fn(),
    countUsuariosByNit: jest.fn().mockResolvedValue(0),
    updateCodVerificacion: jest.fn().mockResolvedValue(true),
    findCorreoCorporativoCodiesel: jest.fn().mockResolvedValue(null),
    findUsuarioIdByCodVerificacion: jest.fn().mockResolvedValue(null),
    resetPasswordToNit: jest.fn().mockResolvedValue(true),
    updatePasswordForzado: jest.fn().mockResolvedValue(true),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    findUsableRefreshTokens: jest.fn().mockResolvedValue([]),
    rotateRefreshToken: jest.fn(),
    ...overrides,
  } as IUserRepository;
}

describe('AuthService.refreshToken', () => {
  const user = new User('10', 123, 'hash', '1', 'stored-hash', 'Ana');

  function buildService(repo: IUserRepository) {
    const jwt = {
      sign: jest.fn().mockReturnValue('jwt'),
      decode: jest.fn().mockReturnValue({ sub: '10' }),
      verify: jest.fn(),
    } as unknown as JwtService;

    return new AuthService(repo, jwt, {} as ConfigService);
  }

  beforeEach(() => {
    compareMock.mockReset();
    compareMock.mockResolvedValue(false as never);
  });

  it('acepta un refresh recién rotado (ventana de reuso)', async () => {
    compareMock.mockResolvedValue(true as never);
    const rotateRefreshToken = jest.fn();
    const repo = mockRepo({
      findById: jest.fn().mockResolvedValue(user),
      findUsableRefreshTokens: jest.fn().mockResolvedValue([
        {
          id: 1,
          refreshTokenHash: 'old-hash',
          revokedAt: new Date(),
          expiresAt: new Date(Date.now() + 86_400_000),
        },
        {
          id: 2,
          refreshTokenHash: 'current-hash',
          revokedAt: null,
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      ]),
      rotateRefreshToken,
    });

    const service = buildService(repo);
    const result = await service.refreshToken('10', 'presented-old-token');

    expect(result.refreshToken).toBe('jwt');
    expect(rotateRefreshToken).toHaveBeenCalledWith('10', 'new-hash');
  });

  it('rechaza si ningún hash usable coincide', async () => {
    const rotateRefreshToken = jest.fn();
    const repo = mockRepo({
      findById: jest.fn().mockResolvedValue(user),
      findUsableRefreshTokens: jest.fn().mockResolvedValue([
        {
          id: 1,
          refreshTokenHash: 'other-hash',
          revokedAt: null,
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      ]),
      rotateRefreshToken,
    });

    const service = buildService(repo);
    await expect(service.refreshToken('10', 'token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(rotateRefreshToken).not.toHaveBeenCalled();
  });
});
