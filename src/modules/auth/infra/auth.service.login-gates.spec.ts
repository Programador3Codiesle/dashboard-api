import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { AUTH_MESSAGES } from '../domain/auth.constants';

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

describe('AuthService.validateUser gates', () => {
  const jwt = {
    sign: jest.fn(),
    decode: jest.fn(),
    verify: jest.fn(),
  } as unknown as JwtService;
  const config = {
    get: jest.fn().mockReturnValue('false'),
  } as unknown as ConfigService;

  it('bloquea usuario inactivo (estado=0)', async () => {
    const user = new User('1', 123, 'hash', '1', null, 'Ana', undefined, 0);
    const service = new AuthService(
      mockRepo({ findByEmail: jest.fn().mockResolvedValue(user) }),
      jwt,
      config,
    );
    await expect(service.validateUser(123, 'secret')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(service.validateUser(123, 'secret')).rejects.toThrow(
      AUTH_MESSAGES.usuarioInactivo,
    );
  });

  it('no encuentra usuario (fid_perfil ventas o sin tercero)', async () => {
    const service = new AuthService(
      mockRepo({ findByEmail: jest.fn().mockResolvedValue(null) }),
      jwt,
      config,
    );
    await expect(service.validateUser(123, 'secret')).rejects.toThrow(
      AUTH_MESSAGES.usuarioNoEncontrado,
    );
  });
});
