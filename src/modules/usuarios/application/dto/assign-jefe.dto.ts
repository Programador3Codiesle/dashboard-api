export class AssignJefeDto {
  jefeId: number;
}

export class JefesResponseDto {
    id: number;
    nombre: string;
    email?: string;
}

export class CreateJefeDto {
    nit: string;
    email: string;
}