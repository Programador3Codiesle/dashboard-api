import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ChecklistCarroFacade } from '../application/checklist-carro.facade';

type JwtRequestUser = {
  sub?: string | number;
  nit?: string | number;
  role?: string | number;
};

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-checklist-carro')
export class InformeChecklistCarroController {
  constructor(private readonly facade: ChecklistCarroFacade) {}

  @Get()
  listar(
    @Req() req: { user?: JwtRequestUser },
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('sede') sede?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const toNum = (v: string | undefined): number | null => {
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const u = req.user;
    const idUsuario =
      u?.sub != null && u.sub !== '' ? Number(u.sub) : null;
    const nitUsuario =
      u?.nit != null && u.nit !== '' ? String(u.nit) : null;
    const perfilRaw = u?.role;
    const perfil =
      perfilRaw != null && perfilRaw !== '' ? Number(perfilRaw) : null;

    return this.facade.listar({
      fechaIni: fechaIni ?? null,
      fechaFin: fechaFin ?? null,
      sede: sede ?? null,
      pagina: toNum(pagina),
      limite: toNum(limite),
      idUsuario: idUsuario != null && Number.isFinite(idUsuario) ? idUsuario : null,
      nitUsuario,
      perfil: perfil != null && Number.isFinite(perfil) ? perfil : null,
    });
  }
}

