// src/modules/auth/infra/auth.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private config: ConfigService) {
        const secretKey = config.get<string>('JWT_ACCESS_TOKEN_SECRET');
        if (!secretKey) {
            throw new Error('JWT_ACCESS_TOKEN_SECRET no está configurado');
        }
        super({
            jwtFromRequest: JwtStrategy.extractJwtFromCookie,
            ignoreExpiration: false,
            secretOrKey: secretKey,
        });
    }

    private static extractJwtFromCookie(req: Request): string | null {
        if (!req || !req.cookies) {
            return null;
        }
        return req.cookies['access_token'] || null;
    }


    async validate(payload: any) {
        return { sub: payload.sub, email: payload.email, role: payload.role };
    }
}