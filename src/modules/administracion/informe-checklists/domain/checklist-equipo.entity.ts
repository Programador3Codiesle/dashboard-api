export class ChecklistEquipoEntity {
  // Entidad flexible: cada checklist tiene campos distintos
  // Permitimos cualquier propiedad dinámica.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(partial: Record<string, any>) {
    Object.assign(this, partial);
  }
}

