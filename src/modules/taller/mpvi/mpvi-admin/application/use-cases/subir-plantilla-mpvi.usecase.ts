import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { IMpviCatalogoRepository } from '../../domain/mpvi-catalogo.repository';

@Injectable()
export class SubirPlantillaMpviUseCase {
  constructor(private readonly repo: IMpviCatalogoRepository) {}

  async execute(buffer: Buffer): Promise<number> {
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return 0;

    const rows: unknown[][] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      rows.push(row.values as unknown[]);
    });

    let filasProcesadas = 0;
    for (const key of rows) {
      const row = key as (string | number | null)[];
      if (!row || row.length < 8) continue;

      const cells = row.slice(1);
      const usaClase = cells.length >= 13;
      const idxClase = usaClase ? 3 : null;
      const idxAnoIni = usaClase ? 4 : 3;
      const idxAnoFin = usaClase ? 5 : 4;
      const idxTempario = usaClase ? 6 : 5;
      const idxTiempo = usaClase ? 7 : 6;
      const idxCodigo = usaClase ? 8 : 7;
      const idxCantidad = usaClase ? 9 : 8;
      const idxAlt1 = usaClase ? 10 : 9;
      const idxAlt2 = usaClase ? 11 : 10;
      const idxAlt3 = usaClase ? 12 : 11;

      const clase =
        idxClase !== null ? String(cells[idxClase] ?? '').trim() : '';
      const idSistema = await this.repo.procesarSistema(
        String(cells[0] ?? '').toUpperCase(),
      );
      const idSubsistema = await this.repo.procesarSubsistema(
        idSistema!,
        String(cells[1] ?? '').toUpperCase(),
      );
      const idVh = await this.repo.procesarVh(
        idSubsistema,
        Number(cells[2]),
        clase,
        Number(cells[idxAnoIni]) || null,
        cells[idxAnoFin] != null && String(cells[idxAnoFin]).trim() !== ''
          ? Number(cells[idxAnoFin])
          : null,
      );
      await this.repo.procesarManoObra(
        idSubsistema!,
        idVh!,
        Number(cells[idxTempario]),
        Number(cells[idxTiempo]),
      );
      const idRp = await this.repo.procesarRepuestos(
        idSubsistema!,
        idVh!,
        String(cells[idxCodigo]),
        Number(cells[idxCantidad]),
      );
      await this.repo.procesarReferencias(
        idRp!,
        String(cells[idxAlt1] ?? ''),
        cells[idxAlt2] != null ? String(cells[idxAlt2]) : null,
        cells[idxAlt3] != null ? String(cells[idxAlt3]) : null,
      );
      filasProcesadas++;
    }
    return filasProcesadas;
  }
}
