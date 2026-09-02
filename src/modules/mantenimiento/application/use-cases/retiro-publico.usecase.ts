import { Injectable } from '@nestjs/common';
import { IMantenimientoRepository } from '../../domain/mantenimiento.repository';
import { todayYmd } from '../utils/fechas';

@Injectable()
export class AutorizarRetiroPublicoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(id: number, nitJefe: string) {
    const ret = await this.repo.getRetiroById(id);
    if (!ret) return { html: '<h3>Solicitud no encontrada</h3>' };
    if (ret.estado === 2) {
      return {
        html: '<h3>Esta solicitud ya ha sido autorizada</h3><h4>Puedes cerrar la pestaña</h4>',
      };
    }
    if (ret.estado === 1) {
      return {
        html: '<h3>Esta solicitud ya ha sido rechazada</h3><h4>Puedes cerrar la pestaña</h4>',
      };
    }
    await this.repo.autorizarRetiro(id, nitJefe, todayYmd());
    await this.repo.updateEstadoEquipo(ret.equipo_id, 'inactivo');
    return {
      html: '<h3>Solicitud autorizada correctamente</h3><h4>Puedes cerrar la pestaña del navegador</h4>',
    };
  }
}

@Injectable()
export class RechazarRetiroPublicoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(id: number, nitJefe: string) {
    const ret = await this.repo.getRetiroById(id);
    if (!ret) return { html: '<h3>Solicitud no encontrada</h3>' };
    if (ret.estado === 1) {
      return {
        html: '<h3>Esta solicitud ya ha sido rechazada</h3><h4>Puedes cerrar la pestaña</h4>',
      };
    }
    if (ret.estado === 2) {
      return {
        html: '<h3>Esta solicitud ya ha sido autorizada</h3><h4>Puedes cerrar la pestaña</h4>',
      };
    }
    await this.repo.rechazarRetiro(id, nitJefe, todayYmd());
    return {
      html: '<h3>Solicitud rechazada correctamente</h3><h4>Puedes cerrar la pestaña del navegador</h4>',
    };
  }
}
