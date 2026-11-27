import { BadRequestException, Injectable } from '@nestjs/common';
import { IEncuestasRepository } from '../../domain/encuestas.repository';
import { nowFechaHora, todayYmd } from '../utils/encuestas-fecha';

/** Placa para recorrer la encuesta de salida sin una orden pendiente. Solo fuera de producción. */
const PLACA_PRUEBA_DEV = 'ENB03F';
const ORDEN_PRUEBA_DEV = 'DEV-ENB03F';
const NIT_PRUEBA_DEV = 'DEVENB03F';

function esDesarrollo(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function esPlacaPruebaDev(placa: string): boolean {
  return esDesarrollo() && placa.trim().toUpperCase() === PLACA_PRUEBA_DEV;
}

@Injectable()
export class EncuestaQrUseCase {
  constructor(private readonly repo: IEncuestasRepository) {}

  async listarPreguntasQr() {
    const all = await this.repo.listarPreguntasEncuesta();
    return all.filter((p) => p.id !== 2 && p.id !== 3);
  }

  async buscarPlaca(placa: string) {
    if (!placa?.trim()) throw new BadRequestException('Placa requerida');
    const normalizada = placa.trim().toUpperCase();
    const data = await this.repo.buscarEncuestaByPlaca(normalizada);
    if (data) return { response: 'success' as const, ...data };
    if (!esPlacaPruebaDev(normalizada)) {
      const yaRegistrada = await this.repo.buscarEncuestaByPlaca(
        normalizada,
        true,
      );
      if (yaRegistrada) {
        return {
          response: 'error' as const,
          message:
            'Esta orden ya tiene una encuesta registrada. Solo se puede responder una vez por orden. Cuando el vehículo ingrese de nuevo, podrá realizar otra encuesta.',
        };
      }
      return {
        response: 'error' as const,
        message: `No hay una orden pendiente para la placa ${normalizada}. Verifique la placa o acérquese al personal del taller.`,
      };
    }

    const respondida = await this.repo.buscarEncuestaByPlaca(normalizada, true);
    if (respondida) return { response: 'success' as const, ...respondida };
    return {
      response: 'success' as const,
      numero: ORDEN_PRUEBA_DEV,
      bodega: '1',
      placa: PLACA_PRUEBA_DEV,
      marca: 'PRUEBA',
      des_modelo: 'DESARROLLO',
      color: '',
      nit_comprador: NIT_PRUEBA_DEV,
      nombres: 'PLACA DE DESARROLLO',
      mail: 'pruebas@codiesel.local',
      celular: '3000000000',
    };
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
    if (esPlacaPruebaDev(body.placa)) {
      return {
        response: 'success' as const,
        opcion: Number(body.opcion) === 0 ? 'el registro' : 'la actualizacion',
      };
    }
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
    if (esDesarrollo() && String(body.fieldNit) === NIT_PRUEBA_DEV) {
      return { response: 'success' as const };
    }
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
    if (
      esDesarrollo() &&
      String(body.numero) === ORDEN_PRUEBA_DEV &&
      esPlacaPruebaDev(String(body.placa))
    ) {
      return { response: 'success' as const };
    }
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
    if (esDesarrollo() && String(body.numero) === ORDEN_PRUEBA_DEV) {
      return { response: 'success' as const };
    }
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

  async validarPlaca(placa: string) {
    const trimmed = placa?.trim() ?? '';
    if (!trimmed) {
      return { ok: false as const, message: 'Error, La Placa No Existe' };
    }
    const n = await this.repo.contarVehiculosByPlaca(trimmed.toUpperCase());
    if (n === 0) {
      return { ok: false as const, message: 'Error, La Placa No Existe' };
    }
    return { ok: true as const, message: 'Bien, La Placa Existe' };
  }

  async responderVentanilla(body: {
    placa: string;
    pregunta2?: string;
    pregunta3?: string;
    pregunta4?: string;
    pregunta5?: string;
    pregunta7: string;
  }) {
    const placa = String(body.placa ?? '')
      .trim()
      .toUpperCase();
    const detalle = String(body.pregunta7 ?? '').trim();
    if (!placa || !detalle) {
      throw new BadRequestException(
        'Error todos los Campos deden ser completado',
      );
    }
    const orden = await this.repo.buscarEncuestaByPlaca(placa);
    const numeroOrden = orden?.numero?.trim() ?? '';
    const bodegaOrden =
      orden?.bodega != null && String(orden.bodega).trim() !== ''
        ? String(orden.bodega).trim()
        : '';
    if (!numeroOrden) {
      const yaRegistrada = await this.repo.buscarEncuestaByPlaca(placa, true);
      if (yaRegistrada) {
        return {
          ok: false,
          message:
            'Esta orden ya tiene una encuesta registrada. Solo se puede cargar una vez por orden. Cuando el vehículo ingrese con una orden nueva, se puede encuestar otra vez.',
        };
      }
      return {
        ok: false,
        message: `No hay una orden pendiente para la placa ${placa}. La encuesta no se guardó.`,
      };
    }
    if (!bodegaOrden) {
      return {
        ok: false,
        message:
          'La orden pendiente no tiene bodega. La encuesta no se guardó.',
      };
    }
    const ok = await this.repo.insertEncuestaSatisfaccionQrVentanilla({
      placa,
      fecha: todayYmd(),
      pregunta1: body.pregunta2 ?? '',
      pregunta2: body.pregunta3 ?? '',
      pregunta3: body.pregunta4 ?? '',
      pregunta4: body.pregunta5 ?? '',
      pregunta5: detalle,
      fuente: 'QR',
      bod: bodegaOrden,
      numeroOrden,
    });
    if (ok) {
      await this.repo.marcarEncuestaRealizada({
        numero: numeroOrden,
        placa,
        bodega: bodegaOrden,
        fechaEncuesta: nowFechaHora(),
      });
    }
    return {
      ok,
      message: ok
        ? 'Encuesta Cargada de Manera Exitosa'
        : 'Error al Cargar La Encuesta',
    };
  }
}
