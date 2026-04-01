export class KpiSedeMensualEntity {
  sede: string;
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;

  constructor(props: {
    sede: string;
    enero: number;
    febrero: number;
    marzo: number;
    abril: number;
    mayo: number;
    junio: number;
    julio: number;
    agosto: number;
    septiembre: number;
    octubre: number;
    noviembre: number;
    diciembre: number;
  }) {
    this.sede = props.sede;
    this.enero = props.enero;
    this.febrero = props.febrero;
    this.marzo = props.marzo;
    this.abril = props.abril;
    this.mayo = props.mayo;
    this.junio = props.junio;
    this.julio = props.julio;
    this.agosto = props.agosto;
    this.septiembre = props.septiembre;
    this.octubre = props.octubre;
    this.noviembre = props.noviembre;
    this.diciembre = props.diciembre;
  }
}

export class KpiTecnicoMensualEntity {
  operario: string;
  tecnico: string;
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;

  constructor(props: {
    operario: string;
    tecnico: string;
    enero: number;
    febrero: number;
    marzo: number;
    abril: number;
    mayo: number;
    junio: number;
    julio: number;
    agosto: number;
    septiembre: number;
    octubre: number;
    noviembre: number;
    diciembre: number;
  }) {
    this.operario = props.operario;
    this.tecnico = props.tecnico;
    this.enero = props.enero;
    this.febrero = props.febrero;
    this.marzo = props.marzo;
    this.abril = props.abril;
    this.mayo = props.mayo;
    this.junio = props.junio;
    this.julio = props.julio;
    this.agosto = props.agosto;
    this.septiembre = props.septiembre;
    this.octubre = props.octubre;
    this.noviembre = props.noviembre;
    this.diciembre = props.diciembre;
  }
}

export class KpiTecnicoDetalladoEntity {
  operario: string;
  tecnico: string;
  ot: KpiTecnicoMensualEntity;
  repuestos: KpiTecnicoMensualEntity;
  manoObra: KpiTecnicoMensualEntity;

  constructor(props: {
    operario: string;
    tecnico: string;
    ot: KpiTecnicoMensualEntity;
    repuestos: KpiTecnicoMensualEntity;
    manoObra: KpiTecnicoMensualEntity;
  }) {
    this.operario = props.operario;
    this.tecnico = props.tecnico;
    this.ot = props.ot;
    this.repuestos = props.repuestos;
    this.manoObra = props.manoObra;
  }
}

export class KpiResumenEntity {
  mantenimientoPreventivo: KpiSedeMensualEntity[];
  cargoCliente: KpiSedeMensualEntity[];
  tecnicos: KpiTecnicoDetalladoEntity[];

  constructor(props: {
    mantenimientoPreventivo: KpiSedeMensualEntity[];
    cargoCliente: KpiSedeMensualEntity[];
    tecnicos: KpiTecnicoDetalladoEntity[];
  }) {
    this.mantenimientoPreventivo = props.mantenimientoPreventivo;
    this.cargoCliente = props.cargoCliente;
    this.tecnicos = props.tecnicos;
  }
}

