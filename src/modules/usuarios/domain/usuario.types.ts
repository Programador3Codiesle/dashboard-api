export interface UsuarioProps {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  createdAt?: Date;
  updatedAt?: Date;
}
