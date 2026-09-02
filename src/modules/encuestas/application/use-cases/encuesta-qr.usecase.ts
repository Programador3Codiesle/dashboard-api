import { BadRequestException, Injectable } from '@nestjs/common';
import { IEncuestasRepository } from '../../domain/encuestas.repository';
import { nowFechaHora, todayYmd } from '../utils/encuestas-fecha';

@Injectable()
export class EncuestaQrUseCase {
  constructor(private readonly repo: IEncuestasRepository) {}

  async listarPreguntasQr() {
    const all = await this.repo.listarPreguntasEncuesta();
    return all.filter((p) => p.id !== 2 && p.id !== 3);
  }

  async buscarPlaca(placa: string) {
    if (!placa?.trim()) throw new BadRequestException('Placa requerida');
    const data = await this.repo.buscarEncuestaByPlaca(
      placa.trim().toUpperCase(),
    );
    if (!data) return { response: 'error' as const };
    return { response: 'success' as const, ...data };
  }

  async buscarNit(nit: string, placa: string) {
    if (!nit || !placa) throw new BadRequestException('NIT y placa requeridos');
    const data = await this.repo.buscarContactoByNit(nit, placa.toUpperCase());
    if (!data) return { response: 'error' as const };
    return { response: 'success' as const, ...data };
  }

  async registrarUsuario(body: {
    nit: string;
    nombres: string;
    celular: string;
    email: string;
    placa: string;
    opcion: number;
  }) {
    const placa = body.placa.toUpperCase();
    if (Number(body.opcion) === 0) {
      const ok = await this.repo.insertContactoPlaca({
        placa,
        nit: body.nit,
        nombres: body.nombres,
        telefono: body.celular,
        mail: body.email,
        fecha_registro: todayYmd(),
      });
      return {
        response: ok ? ('success' as const) : ('error' as const),
        opcion: 'el registro',
      };
    }
    const ok = await this.repo.updateContactoPlaca(
      { nit: body.nit, placa },
      {
        nombres: body.nombres,
        telefono: body.celular,
        mail: body.email,
        fecha_actualizacion: nowFechaHora(),
      },
    );
    return {
      response: ok ? ('success' as const) : ('error' as const),
      opcion: 'la actualizacion',
    };
  }

  async actualizarTercero(body: {
    fieldNit: string;
    fieldMailUpdate: string;
    fieldPhoneUpdate: string;
  }) {
    const ok = await this.repo.updateTercero(body.fieldNit, {
      mail: body.fieldMailUpdate,
      celular: body.fieldPhoneUpdate,
    });
    return { response: ok ? ('success' as const) : ('error' as const) };
  }

  async responderEncuesta(body: {
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
    const placa = String(body.placa).toUpperCase();
    const okInsert = await this.repo.insertEncuestaSatisfaccionQr({
      placa,
      fecha: todayYmd(),
      pregunta1: body.pregunta1,
      pregunta2: 0,
      pregunta3: body.pregunta4 ?? null,
      pregunta4: body.pregunta5 ?? null,
      pregunta5: body.pregunta7 ?? null,
      fuente: 'QR',
      bod: body.bod,
      numero_orden: body.numero,
    });
    if (!okInsert) return { response: 'error' as const };

    const fecha_encuesta = nowFechaHora();
    const dataOrder = {
      encuesta: 1,
      propietario: body.propietario,
      fecha_encuesta,
      usuario_vh: body.fieldNit,
    };

    const affected = await this.repo.updateOrdenSalida(body.numero, dataOrder);
    if (affected <= 0) {
      const okI = await this.repo.insertOrdenSalida({
        numero: body.numero,
        placa_vh: placa,
        bodega_o: body.bodega ?? body.bod,
        ...dataOrder,
      });
      if (!okI) return { response: 'error' as const };
    }

    if (String(body.pregunta1) === '6' && String(body.propietario) === '1') {
      const okT = await this.repo.updateTercero(String(body.fieldNit), {
        concepto_7: 2,
      });
      return { response: okT ? ('success' as const) : ('error' as const) };
    }

    const okC = await this.repo.updateContactoPlaca(
      { nit: String(body.fieldNit), placa },
      { contactar: 0, fecha_actualizacion: nowFechaHora() },
    );
    return { response: okC ? ('success' as const) : ('error' as const) };
  }

  async sinEncuesta(body: {
    numero: string | number;
    propietario: string | number;
    nit: string | number;
  }) {
    const fecha_encuesta = nowFechaHora();
    const dataOrder = {
      encuesta: 0,
      propietario: body.propietario,
      fecha_encuesta,
      usuario_vh: body.nit,
    };
    const exists = await this.repo.selectOrdenSalida(body.numero);
    if (exists) {
      const ok = await this.repo.updateOrdenSalida(body.numero, dataOrder);
      return { response: ok > 0 ? ('success' as const) : ('error' as const) };
    }
    const ok = await this.repo.insertOrdenSalida({
      numero: body.numero,
      ...dataOrder,
    });
    return { response: ok ? ('success' as const) : ('error' as const) };
  }
}
