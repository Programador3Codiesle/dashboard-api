export class User {
    constructor(
        public readonly id: string,            // id_usuario
        public readonly nit_usuario: number,   // nit_usuario
        public readonly clave: string,         // clave
        public readonly perfil_postventa: string = 'USER',    // perfil_postventa (u otro campo de perfil)
        public readonly refreshTokenHash?: string | null,
        public readonly nombre_usuario?: string,
        public readonly nombre_perfil?: string,
    ) {}

    public changePassword(newHash: string) {
        return new User(
            this.id,
            this.nit_usuario,
            newHash,
            this.perfil_postventa,
            null, // reset refresh token después del cambio
        );
    }
}
