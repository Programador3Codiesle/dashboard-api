import { Injectable } from '@nestjs/common';
import { DetalleSatisfaccionUseCase } from './use-cases/detalle-satisfaccion.usecase';
import { EncuestaQrUseCase } from './use-cases/encuesta-qr.usecase';
import { ListarSatisfaccionUseCase } from './use-cases/listar-satisfaccion.usecase';
import { NpsColmotoresUseCase } from './use-cases/nps-colmotores.usecase';
import { NpsTecnicosExcelUseCase } from './use-cases/nps-tecnicos-excel.usecase';

@Injectable()
export class EncuestasFacade {
  constructor(
    private readonly listarSatisfaccionUc: ListarSatisfaccionUseCase,
    private readonly detalleSatisfaccionUc: DetalleSatisfaccionUseCase,
    private readonly npsColmotores: NpsColmotoresUseCase,
    private readonly npsTecnicosExcel: NpsTecnicosExcelUseCase,
    private readonly encuestaQr: EncuestaQrUseCase,
  ) {}

  listarSatisfaccion(q: string | undefined, page: number, pageSize: number) {
    return this.listarSatisfaccionUc.execute(q, page, pageSize);
  }

  detalleSatisfaccion(ot: string) {
    return this.detalleSatisfaccionUc.execute(ot);
  }

  listarTecnicosNps() {
    return this.npsColmotores.listarTecnicos();
  }

  insertNpsSede(body: {
    sede: string;
    fecha: string;
    calificacion: number;
    cal06: number;
    cal78: number;
    cal910: number;
  }) {
    return this.npsColmotores.insertNpsSede(body);
  }

  insertNpsTecnico(body: {
    sede: string;
    tecnico: string;
    fecha: string;
    calificacion: number;
    placa: string;
    tipificacion: string;
    tipo_cal: '0a6' | '7a8' | '9a10';
  }) {
    return this.npsColmotores.insertNpsTecnico(body);
  }

  uploadNpsTecnicos(buffer: Buffer) {
    return this.npsTecnicosExcel.uploadNpsTecnicos(buffer);
  }

  generarPlantillaNps() {
    return this.npsTecnicosExcel.generarPlantillaNps();
  }

  listarPreguntasQr() {
    return this.encuestaQr.listarPreguntasQr();
  }

  buscarPlaca(placa: string) {
    return this.encuestaQr.buscarPlaca(placa);
  }

  buscarNit(nit: string, placa: string) {
    return this.encuestaQr.buscarNit(nit, placa);
  }

  registrarUsuario(body: {
    nit: string;
    nombres: string;
    celular: string;
    email: string;
    placa: string;
    opcion: number;
  }) {
    return this.encuestaQr.registrarUsuario(body);
  }

  actualizarTercero(body: {
    fieldNit: string;
    fieldMailUpdate: string;
    fieldPhoneUpdate: string;
  }) {
    return this.encuestaQr.actualizarTercero(body);
  }

  responderEncuesta(body: {
    placa: string;
    pregunta1: string | number;
    pregunta4?: string | number | null;
    pregunta5?: string | number | null;
    pregunta7?: string | null;
    bod: string | number;
    numero: string | number;
    fieldNit: string | number;
    propietario: string | number;
    bodega?: string | number;
  }) {
    return this.encuestaQr.responderEncuesta(body);
  }

  sinEncuesta(body: {
    numero: string | number;
    propietario: string | number;
    nit: string | number;
  }) {
    return this.encuestaQr.sinEncuesta(body);
  }
}
