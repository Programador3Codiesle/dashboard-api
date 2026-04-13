import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformeControlVehicularFacade } from '../application/informe-control-vehicular.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-control-vehicular')
export class InformeControlVehicularController {
  constructor(private readonly facade: InformeControlVehicularFacade) {}

  @Get()
  async listar(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('buscador') buscador?: string,
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('porteria') porteria?: string,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const result = await this.facade.listar({
      page: pageNum,
      limit: limitNum,
      buscador: buscador ?? null,
      fechaIni: fechaIni ?? null,
      fechaFin: fechaFin ?? null,
      porteria: porteria ?? null,
    });

    return {
      status: true,
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('detalle')
  async detalle(@Query('id') id: string) {
    const numericId = Number(id);
    if (!numericId) {
      return { status: false, data: null };
    }
    const registro = await this.facade.detalle(numericId);
    return { status: !!registro, data: registro };
  }

  @Get('exportar')
  async exportar(
    @Res() res: Response,
    @Query('buscador') buscador?: string,
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('porteria') porteria?: string,
  ) {
    const rows = await this.facade.exportar({
      page: 1,
      limit: 1000000,
      buscador: buscador ?? null,
      fechaIni: fechaIni ?? null,
      fechaFin: fechaFin ?? null,
      porteria: porteria ?? null,
    });

    const header = [
      'Porteria',
      'Fecha salida',
      'Hora salida',
      'Km salida',
      'Placa',
      'Tipo vehículo',
      'Modelo',
      'Conductor',
      'Pasajeros',
      'Autorizado por',
      'Placa Remolcado',
      'Taller',
      'Fecha llegada',
      'Hora llegada',
      'Km llegada',
      'Observación',
    ];

    const lines = rows.map((r) =>
      [
        r.porteria ?? '',
        r.fecha_salida ?? '',
        r.hora_salida ?? '',
        r.km_salida ?? '',
        r.placa ?? '',
        r.tipo_vehiculo ?? '',
        r.modelo ?? '',
        r.conductor ?? '',
        r.pasajeros ?? '',
        r.persona_autorizo ?? '',
        r.placa_vh_remolcado ?? '',
        r.taller ?? '',
        r.fecha_llegada ?? '',
        r.hora_llegada ?? '',
        r.km_llegada ?? '',
        r.observacion ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(';'),
    );

    const csv = [header.join(';'), ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="informe_ingreso_y_salida_de_vehiculos.csv"',
    );

    res.send(csv);
  }
}
