import { Injectable } from '@nestjs/common';
import { IEntradasVariasRepository } from '../../shared/domain/entradas-varias.repository';
import { resolverAlcanceListadoEv } from '../../shared/domain/ev-permisos';
import { ListarSolicitudesEvDto } from '../../solicitudes-ev/application/dto/solicitudes-ev.dto';

export type InformeEvSvItem = {
  id: number;
  nOrden: number;
  placa: string | null;
  bodega: string | null;
  solicitadoPor: string | null;
  autorizadoPor: string | null;
  gestionRepuestos: Array<{
    ev: string;
    sv: string;
    otSv: string;
    pendiente: boolean;
  }>;
  gestionBodega: Array<{
    nOrden: number;
    entregados: number;
    noEntregados: number;
    pendiente: boolean;
  }>;
  colorEstado: 'amarillo' | 'morado' | 'rojo' | 'verde';
};

@Injectable()
export class InformeEvSvFacade {
  constructor(private readonly repo: IEntradasVariasRepository) {}

  listarBodegas() {
    return this.repo.listarBodegas();
  }

  async listar(
    dto: ListarSolicitudesEvDto,
    userId: number,
    perfil: number,
  ): Promise<InformeEvSvItem[]> {
    const scope = resolverAlcanceListadoEv(userId, perfil, true);
    const rows = await this.repo.listarSolicitudes({
      idSolicitud: dto.idSolicitud,
      nOrden: dto.nOrden,
      placa: dto.placa?.toUpperCase(),
      bodega: dto.bodega,
      fechaRegistro: dto.fechaRegistro,
      userRegister: scope.soloPropias ? userId : undefined,
      bodegasIn: scope.bodegasIn,
    });

    const result: InformeEvSvItem[] = [];

    for (const row of rows) {
      let autorizado = 'PENDIENTE';
      let gestionRepuestos: InformeEvSvItem['gestionRepuestos'] = [];
      const gestionBodega: InformeEvSvItem['gestionBodega'] = [];
      let colorEstado: InformeEvSvItem['colorEstado'] = 'amarillo';
      let hayPendienteEvSv = false;
      let hayPendienteEntrega = false;

      if (row.estado_auth !== 0) {
        autorizado = row.nombres_auth ?? 'N/A';
        const grupos = await this.repo.gestionRepuestos(row.id);

        if (grupos.length === 0) {
          gestionRepuestos = [];
          hayPendienteEvSv = true;
        } else {
          for (const g of grupos) {
            const sv =
              g.tipo_sv && g.numero_sv ? `${g.tipo_sv}-${g.numero_sv}` : 'P';
            const otSv =
              g.tipo_sv && g.numero_sv ? String(g.numero_o_sv ?? 'P') : 'P';
            const pendiente = !g.tipo_sv || !g.numero_sv;
            if (pendiente) hayPendienteEvSv = true;

            gestionRepuestos.push({
              ev: `${g.tipo_ev}-${g.numero_ev}`,
              sv,
              otSv,
              pendiente,
            });

            if (g.tipo_sv && g.numero_sv && g.numero_o_sv) {
              const entregas = await this.repo.entregaRepuestos(
                row.id,
                g.tipo_sv,
                g.numero_sv,
                g.numero_o_sv,
              );
              let entregados = 0;
              let noEntregados = 0;
              for (const e of entregas) {
                if (e.entregado === 1) entregados++;
                else noEntregados++;
              }
              const pendienteEntrega = noEntregados > 0;
              if (pendienteEntrega) hayPendienteEntrega = true;
              gestionBodega.push({
                nOrden: g.numero_o_sv,
                entregados,
                noEntregados,
                pendiente: pendienteEntrega,
              });
            }
          }
        }
      }

      if (autorizado === 'PENDIENTE') colorEstado = 'amarillo';
      else if (hayPendienteEvSv) colorEstado = 'morado';
      else if (hayPendienteEntrega) colorEstado = 'rojo';
      else colorEstado = 'verde';

      result.push({
        id: row.id,
        nOrden: row.n_orden,
        placa: row.placa,
        bodega: row.descripcion_bodega,
        solicitadoPor: row.nombres,
        autorizadoPor: autorizado,
        gestionRepuestos,
        gestionBodega,
        colorEstado,
      });
    }

    return result;
  }
}
