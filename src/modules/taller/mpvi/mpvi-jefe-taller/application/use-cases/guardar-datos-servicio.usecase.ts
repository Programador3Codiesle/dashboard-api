import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';
import { MpviEmailService } from '../../../mpvi-shared/application/mpvi-email.service';
import { aplicarEjecutadoServicioMpvi } from '../../../mpvi-shared/application/helpers/aplicar-ejecutado-servicio.helper';
import type { GuardarDatosServicioDto } from '../dto/mpvi-jefe-taller.dto';

@Injectable()
export class GuardarDatosServicioUseCase {
  constructor(
    private readonly repo: IMpviCotizacionRepository,
    private readonly emailService: MpviEmailService,
  ) {}

  async execute(dto: GuardarDatosServicioDto, idUser: number) {
    const operaciones = dto.operaciones.split(',');
    const repuestos = dto.repuestos.split(',');
    const disponibilidad = dto.disponibilidad.split(',');
    const autorizaciones = dto.autorizaciones.split(',');
    const subsistemas = dto.subsistemas.split(',');
    const valoresIniciales = dto.valoresAuto.split(',');
    const valoresInicialesDisp = dto.valoresDisp.split(',');
    const nota = (dto.nota ?? '').trim();
    const opEjecutado = Number(dto.opGuardar);

    const encabezado = await this.repo.getEncabezado(dto.idCotizacion);
    const resCotizacion = encabezado[0];
    if (!resCotizacion) {
      return { ok: false };
    }

    const arrIndicesSubsistemas: number[] = [];
    for (let i = 0; i < subsistemas.length; i++) {
      const vi = valoresIniciales[i] ?? '';
      const va = autorizaciones[i] ?? '';
      if (vi !== va) {
        arrIndicesSubsistemas.push(i);
      }
    }

    if (arrIndicesSubsistemas.length === 0 && opEjecutado === 1) {
      await aplicarEjecutadoServicioMpvi(
        this.repo,
        dto.idCotizacion,
        subsistemas,
        operaciones,
        repuestos,
        disponibilidad,
        autorizaciones,
        valoresInicialesDisp,
        dto.op,
      );
      await this.emailService.sendCorreoCotizacion(dto.idCotizacion, 2);
      return { ok: true };
    }

    let totalAutorizado =
      dto.op === 1
        ? Number(resCotizacion.total_autorizado ?? 0) + Number(dto.totalAutorizado)
        : Number(dto.totalAutorizado);

    await this.repo.actualizarCotizacionMpvi(
      dto.idCotizacion,
      totalAutorizado,
      nota,
      dto.diasProxContacto,
    );

    let iOperaciones = 0;
    let iRepuestos = 0;

    if (arrIndicesSubsistemas.length > 0) {
      const nFilas = Math.max(
        operaciones.length,
        repuestos.length,
        subsistemas.length,
      );

      for (let i = 0; i < nFilas; i++) {
        const codOp = operaciones[i] ?? '';
        if (codOp !== '' && arrIndicesSubsistemas.includes(i)) {
          const aut = Number(autorizaciones[i] ?? 0);
          const sub = Number(subsistemas[i] ?? 0);
          const disp = disponibilidad[i] ?? '1';
          const logOk = await this.repo.guardarCotizacionMpviLog(
            dto.idCotizacion,
            codOp,
            idUser,
            1,
            aut,
          );
          iOperaciones += logOk ? 1 : -1;
          await this.repo.actualizarCotizacionMpviDetallada(
            dto.idCotizacion,
            sub,
            codOp,
            disp,
            idUser,
            aut,
          );
        }
      }

      for (let i = 0; i < nFilas; i++) {
        const codRep = repuestos[i] ?? '';
        if (codRep !== '' && arrIndicesSubsistemas.includes(i)) {
          const aut = Number(autorizaciones[i] ?? 0);
          const sub = Number(subsistemas[i] ?? 0);
          const disp = disponibilidad[i] ?? '1';
          const logOk = await this.repo.guardarCotizacionMpviLog(
            dto.idCotizacion,
            codRep,
            idUser,
            1,
            aut,
          );
          iRepuestos += logOk ? 1 : -1;
          await this.repo.actualizarCotizacionMpviDetallada(
            dto.idCotizacion,
            sub,
            codRep,
            disp,
            idUser,
            aut,
          );
        }
      }

      if (iOperaciones + iRepuestos < arrIndicesSubsistemas.length) {
        return { ok: false };
      }
    }

    if (opEjecutado === 1) {
      await aplicarEjecutadoServicioMpvi(
        this.repo,
        dto.idCotizacion,
        subsistemas,
        operaciones,
        repuestos,
        disponibilidad,
        autorizaciones,
        valoresInicialesDisp,
        dto.op,
      );
      await this.emailService.sendCorreoCotizacion(dto.idCotizacion, 2);
    }

    return { ok: true };
  }
}
