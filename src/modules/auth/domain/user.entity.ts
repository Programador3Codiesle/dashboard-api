export class User {
    constructor(
        public readonly id: string,            
        public readonly nit_usuario: number,   
        public readonly clave: string,        
        public readonly perfil_postventa: string = 'USER',   
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
            null,
        );
    }
}
