import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';
import { MpviEmailService } from '../../../mpvi-shared/application/mpvi-email.service';
import { procesarDatosInsercion } from '../../../mpvi-shared/application/helpers/procesar-datos-insercion.helper';
import type { GuardarDatosDto } from '../dto/mpvi-tecnicos.dto';

@Injectable()
export class GuardarDatosUseCase {
  constructor(
    private readonly repo: IMpviCotizacionRepository,
    private readonly emailService: MpviEmailService,
  ) {}

  async execute(dto: GuardarDatosDto, idUser: number) {
    const placa = dto.placa.toUpperCase();
    const cobrables = (dto.cobrables ?? '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    const disponibilidad = dto.disponibilidad.split(',');
    const autorizados = dto.autorizados
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    const urgentesList = (dto.urgentes ?? '')
      .split(',')
      .filter((s) => s.trim() !== '');
    const recomendadosList = (dto.recomendados ?? '')
      .split(',')
      .filter((s) => s.trim() !== '');
    const ejecutados =
      urgentesList.length + recomendadosList.length === autorizados.length
        ? 1
        : 0;

    let idCotizacion: number | null = null;
    let totalCotizacion = 0;
    let totalAutorizado = 0;
    const arrRes: number[] = [];
    let j = 0;
    const nota = (dto.nota ?? '').trim();

    for (let i = 0; i < 2; i++) {
      const datos = i === 0 ? dto.urgentes : dto.recomendados;
      if (!datos || datos.trim() === '') continue;

      const manoObra = await this.repo.getValorManoObra(dto.bod, placa, datos);
      const repuestos = await this.repo.getValorRepuestos(dto.bod, placa, datos);

      const procesado = procesarDatosInsercion(
        manoObra,
        repuestos,
        cobrables,
        disponibilidad,
        autorizados,
        idUser,
        i,
        j,
      );
      j = procesado.indiceDisponibilidad;
      totalCotizacion += procesado.totalCotizacion;
      totalAutorizado += procesado.totalAutorizado;

      if (idCotizacion === null) {
        idCotizacion = await this.repo.guardarCotizacionMpvi(
          placa,
          dto.bod,
          dto.nombre,
          dto.celular,
          dto.correo,
          procesado.totalCotizacion,
          procesado.totalAutorizado,
          nota,
          dto.diasProxContacto,
          dto.num_orden ?? '',
        );
        if (idCotizacion != null) {
          await this.repo.guardarCotizacionMpviLog(
            idCotizacion,
            'creación',
            idUser,
            0,
          );
        }
      }

      if (idCotizacion != null) {
        const detalleMo = procesado.manoObra.map((item) => ({
          ...item,
          id_cotizacion: idCotizacion!,
          ejecutado: ejecutados,
        }));
        const detalleRep = procesado.repuestos.map((item) => ({
          ...item,
          id_cotizacion: idCotizacion!,
          ejecutado: ejecutados,
        }));

        await this.repo.actualizarCotizacionMpvi(
          idCotizacion,
          totalAutorizado,
          nota,
          dto.diasProxContacto,
          totalCotizacion,
        );

        const res1 = await this.repo.guardarCotizacionMpviDetalle(detalleMo);
        const res2 = await this.repo.guardarCotizacionMpviDetalle(detalleRep);
        arrRes.push(res1 + res2);
      }
    }

    if (idCotizacion != null) {
      await this.emailService.sendCorreoCotizacion(idCotizacion, 1);
    }

    return {
      ok: idCotizacion != null && arrRes.length > 0 && arrRes.every((n) => n > 0),
      idCotizacion: idCotizacion != null ? Number(idCotizacion) : null,
    };
  }
}
