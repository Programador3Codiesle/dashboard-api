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

/** Punto para gráficos (label + valor). */
export interface DataPointDto {
  label: string;
  y: number;
}

/** Datos por sede para tabs y gráficos del dashboard jefe de taller. */
export interface JefeTallerSedeDto {
  sede: string;
  totalVenta: number;
  totalVentaManoObra: number;
  totalVentaRepuesto: number;
  totalVentaTot: number;
  totalHoras: number;
  objectiveNpsIntCurrent: number;
  objectiveNpsGMIntCurrent: number;
  dataPoints1: DataPointDto[];
  dataPoints2: DataPointDto[];
  dataPoints3: DataPointDto[];
  dataPoints4: DataPointDto[];
  dataPoints5: DataPointDto[];
  dataPoints6: DataPointDto[];
  dataPoints7: DataPointDto[];
  objetiveNps: DataPointDto[];
  objetiveNpsGM: DataPointDto[];
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
  data_bodegas?: Array<{
    operario: string;
    tecnico: string;
    numero_orden: number;
    cliente: string;
    rptos: number;
    MO: number;
    horas_facturadas: number;
  }>;
  /** Por sede: totales y series para tabs y 4 gráficos. Si tiene longitud > 0, el front muestra tabs + gráficos. */
  sedes?: JefeTallerSedeDto[];
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
  ranking_presupuesto: Array<{
    operario: number;
    tecnico: string;
    rptos: number;
    MO: number;
    suma_todo: number;
  }> | null;
  tope_ran_pres: number;
  ventas_mensuales?: Array<{
    mes: string;
    mo: number;
    repuestos: number;
    total: number;
  }>;
  horas_mensuales?: Array<{
    mes: string;
    horas: number;
  }>;
  nps_interno_mensual?: Array<{
    mes: string;
    nps: number;
  }>;
  nps_gm_mensual?: Array<{
    mes: string;
    nps: number;
  }>;
}

export interface AdminSedePresupuestoDto {
  /** Clave interna de sede, ej: giron, rosita, barranca, bocono, solochevrolet, chevropartes. */
  key: string;
  /** Nombre legible de la sede. */
  sede: string;
  /** Presupuesto mensual de la sede. */
  presupuesto: number;
  /** Total vendido acumulado en el mes. */
  total: number;
  /** Porcentaje de cumplimiento frente al presupuesto (0–∞). */
  porcentaje: number;
  /** true si porcentaje >= 100 (meta cumplida). */
  metaCumplida: boolean;
}

export interface AdminTallerDetalleDto {
  /** Nombre del taller, ej: Taller Diesel Girón. */
  nombre: string;
  /** Meta (presupuesto) del taller para el mes. */
  presupuesto: number;
  /** Total vendido del taller. */
  total: number;
  /** Porcentaje de cumplimiento frente al presupuesto del taller. */
  porcentaje: number;
  /** true si porcentaje >= 100 (meta cumplida). */
  metaCumplida: boolean;
  /** Total mano de obra asociado (si aplica). */
  mo?: number;
  /** Total TOT asociado (si aplica). */
  tot?: number;
  /** Total repuestos asociado (si aplica). */
  rep?: number;
}

export interface AdminSedeTalleresDto {
  /** Clave interna de sede, ej: giron, rosita, barranca, bocono, solochevrolet, chevropartes. */
  key: string;
  /** Nombre legible de la sede. */
  sede: string;
  /** Lista de talleres de la sede con sus KPIs. */
  talleres: AdminTallerDetalleDto[];
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
  /** Resumen de presupuesto vs total vendido por sede. */
  sedes_presupuesto?: AdminSedePresupuestoDto[];
  /**
   * Detalle de talleres por sede (gasolina, diésel, colisión, mostrador).
   * Inicialmente opcional; se puede ir poblando progresivamente.
   */
  sedes_talleres?: AdminSedeTalleresDto[];
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
  /** Lista de sedes del usuario (para tabs cuando hay más de una). */
  sedes?: Array<{ idsede: number; idsede_v: string; descripcion: string }>;
  /** Presupuesto por sede del usuario (descripcion, presupuesto). */
  presupuestos_sede?: Array<{ sede: string; presupuesto: number }>;
  resumen_actual?: Array<{
    nombre: string;
    sede: string;
    sede_label2: string;
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
  pendientes?: number;
  proceso?: number;
  finalizadas?: number;
  pendientesPre?: number;
  procesoPre?: number;
  finalizadasPre?: number;
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
