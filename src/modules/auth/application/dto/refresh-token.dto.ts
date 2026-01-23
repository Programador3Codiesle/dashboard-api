import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @IsString()
    @ApiProperty({ example: 'refresh_token_string', description: 'Token de refresco' })
    refreshToken: string;
}   