import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import {
  IMpviCatalogoRepository,
  SubirTablasAuxiliaresResult,
} from '../../domain/mpvi-catalogo.repository';

@Injectable()
export class SubirTablasAuxiliaresUseCase {
  constructor(private readonly repo: IMpviCatalogoRepository) {}

  async execute(
    buffer: Buffer,
    tabla: number,
  ): Promise<SubirTablasAuxiliaresResult> {
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return { filasInsertadas: 0, filasRechazadas: 0, filasProcesadas: 0 };
    }

    const rows: string[][] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const vals = (row.values as unknown[]).slice(1).map((v) =>
        v == null ? '' : String(v),
      );
      if (vals.some((v) => v !== '')) {
        rows.push(vals);
      }
    });

    await this.repo.deleteDataTabla(tabla);

    let filasInsertadas = 0;
    let filasRechazadas = 0;
    let filasProcesadas = 0;

    for (const key of rows) {
      let ok = false;
      switch (tabla) {
        case 0:
          ok = await this.repo.almacenarDatosGmica(key);
          break;
        case 1:
          ok = await this.repo.almacenarDatosRepuestos(key);
          break;
        case 2:
          ok = await this.repo.almacenarDatosReemplazos(key);
          break;
      }
      if (ok) filasInsertadas++;
      else filasRechazadas++;
      filasProcesadas++;
    }

    return { filasInsertadas, filasRechazadas, filasProcesadas };
  }
}
