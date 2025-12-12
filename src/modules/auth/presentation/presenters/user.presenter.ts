import { Exclude, Expose } from 'class-transformer';

export class UserPresenter {
    @Expose()
    id: string;

    @Expose()
    nit_usuario: number;

    @Expose()
    perfil_postventa: string;

    @Exclude()
    clave: string;

    @Exclude()
    refreshTokenHash?: string | null;

    constructor(partial: Partial<UserPresenter>) {
        Object.assign(this, partial);
    }
}
