/**
 * Dashboard response DTOs by variant (perfil).
 * Alineado con Postventa/application/views/admin.php (31 agentecc, 46 informe_mto, 1/32 admin, 22/23 gerencia, 33/20 jefe_taller, 34 asesor_rep, 28 compras).
 */
export type DashboardVariant =
  | 'jefe_taller'
  | 'tecnicos'
  | 'admin'
  | 'agente_cc'
  | 'gerencia'
  | 'asesor_rep'
  | 'compras'
  | 'informe_mto';

export interface DashboardBase {
  variant: DashboardVariant;
  fecha_actual: string;
  dia_festivo: number;
  id_usu?: string;
  img_user?: string;
}

export interface DashboardJefeTallerDto extends DashboardBase {
  variant: 'jefe_taller';
  nps_int: number;
  total_ventas: number;
  nps_col: number;
  horas_fac: number;
  mo: number;
  rep: number;
  tot: number;
  bod: string;
  data_bodegas: Array<{
    operario: string;
    tecnico: string;
    numero_orden: number;
    cliente: string;
    rptos: number;
    MO: number;
    horas_facturadas: number;
  }>;
}

export interface DashboardTecnicosDto extends DashboardBase {
  variant: 'tecnicos';
  nps_int: number;
  total_ventas: number;
  nps_col: number;
  horas_fac: number;
  mo: number;
  rep: number;
  bod_usu: string;
  ranking_talleres: { ran_vendido: number; ran_nps: number };
  ranking_sedes: { ran_vendido: number; ran_nps: number };
  ranking_presupuesto: Array<unknown> | null;
  tope_ran_pres: number;
}

export interface DashboardAdminDto extends DashboardBase {
  variant: 'admin';
  graf_sedes?: Array<{ total: number; sede: string }>;
  porcen_giron?: number;
  porcen_rosita?: number;
  porcen_barranca?: number;
  porcen_bocono?: number;
  porcen_soloc?: number;
  porcen_chev?: number;
  to_posv?: number;
  cal_pac?: { Calificacion?: number };
  to_inv?: number;
  nps_int?: number;
  pendientes?: number;
  proceso?: number;
  finalizadas?: number;
  pendientesPre?: number;
  procesoPre?: number;
  finalizadasPre?: number;
  data_estado?: Array<{ estado: string }>;
}

/** Perfil 31: Agente Call Center — mismo contenido admin + data_estado para cambiar estado. */
export interface DashboardAgenteCCDto extends DashboardBase {
  variant: 'agente_cc';
  data_estado?: Array<{ estado: string }>;
}

/** Perfiles 22, 23: Gerencia — mismo contenido que admin (informe posventa por sedes/talleres). */
export interface DashboardGerenciaDto extends DashboardBase {
  variant: 'gerencia';
  graf_sedes?: Array<{ total: number; sede: string }>;
  porcen_giron?: number;
  porcen_rosita?: number;
  porcen_barranca?: number;
  porcen_bocono?: number;
  porcen_soloc?: number;
  porcen_chev?: number;
  to_posv?: number;
  cal_pac?: { Calificacion?: number };
  to_inv?: number;
  nps_int?: number;
}

/** Perfil 28: Compras — resumen solicitudes pendientes / en proceso / finalizadas. */
export interface DashboardComprasDto extends DashboardBase {
  variant: 'compras';
  solicitudes_pendientes: number;
  solicitudes_proceso: number;
  solicitudes_finalizadas: number;
}

/** Perfil 34: Asesor de repuestos — presupuesto por sede + gráfica ventas (placeholder). */
export interface DashboardAsesorRepDto extends DashboardBase {
  variant: 'asesor_rep';
  /** Presupuesto por sede del usuario (descripcion, presupuesto). */
  presupuestos_sede?: Array<{ sede: string; presupuesto: number }>;
  resumen_actual?: Array<{
    nombre: string;
    sede: string;
    venta_neta: number;
    margen_bruto: number;
    utilidad_bruta: number;
    comision: number;
    valor_comision: number;
    comision_variable?: number;
    valor_comision_variable?: number;
    total_comision: number;
  }>;
  total_vendido_global?: number;
}

/** Perfil 46: Informe solicitud mantenimiento — solo bloque MTO. */
export interface DashboardInformeMtoDto extends DashboardBase {
  variant: 'informe_mto';
  pendientes: number;
  proceso: number;
  finalizadas: number;
  pendientesPre: number;
  procesoPre: number;
  finalizadasPre: number;
}

export type DashboardResponseDto =
  | DashboardJefeTallerDto
  | DashboardTecnicosDto
  | DashboardAdminDto
  | DashboardAgenteCCDto
  | DashboardGerenciaDto
  | DashboardComprasDto
  | DashboardAsesorRepDto
  | DashboardInformeMtoDto;
