/**
 * Presenter de Usuario
 * Representa la estructura de salida para la API
 */
export class UsuarioPresenter {
  id!: string;
  nombre!: string;
  email?: string;
  telefono?: string;
  rol!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<UsuarioPresenter>) {
    Object.assign(this, props);
  }
}
