export class ChecklistEquipoEntity {
  // Entidad flexible: cada checklist tiene campos distintos
  // Permitimos cualquier propiedad dinámica.

  [key: string]: any;

  constructor(partial: Record<string, any>) {
    Object.assign(this, partial);
  }
}
