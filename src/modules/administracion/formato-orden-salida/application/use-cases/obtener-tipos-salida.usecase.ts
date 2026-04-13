import { Injectable } from '@nestjs/common';

export interface TipoSalida {
  id: number;
  descripcion: string;
}

@Injectable()
export class ObtenerTiposSalidaUseCase {
  /**
   * Replica la lógica de generarComboTiposSalidas de CodeIgniter,
   * pero devolviendo un arreglo tipado en lugar de HTML.
   */
  execute(nitJefe: number): TipoSalida[] {
    const tipos_salidas: Record<number, string> = {
      1: 'VH Taller entregado a cliente',
      2: 'Repuestos',
      3: 'Cuatrinario SVP019',
      4: 'N400 WOM803',
      5: 'Niñera TAV656',
      6: 'N300 TTR469',
      7: 'NHR XMB415',
      8: 'VH Usado',
      9: 'Material Publicitario',
      10: 'Test Drive',
      11: 'Equipo de Sistemas',
      12: 'VH Accesorizados',
      13: 'Objetos Varios',
      14: 'Mobiliario',
      15: 'VH Nuevos para entrega',
      16: 'VH Taller prueba de ruta',
      17: 'VH Nuevos sin placa',
      18: 'Vehículos disposición residuos',
      19: 'Herramienta',
      20: 'Traslado a carrocería',
      21: 'NXR Demo Dieselco',
    };

    const jefes_tipos_salidas: Record<number, number[]> = {
      91274670: [1, 2, 16], // Carlos Lozano
      1005157209: [1, 2, 16], // Johan Garcia
      1098668953: [1, 2, 16], // Sergio Barajas
      80872884: [10, 21], // Juan Mier
      1065913432: [1, 2, 6, 12, 16, 19], // Luis Puche / Manuelita
      1090449765: [1, 2, 6, 16], // Karol Gomez
      1092358562: [1, 2, 6, 16], // Zulay Villalba
      1094532250: [1, 2, 6, 12, 16], // Oscar Romero
      91259929: [1, 2, 4, 7, 16], // Mauricio Galvis
      1095913265: [1, 2, 16], // Cesar Caicedo
      1092355065: [1, 2, 16], // David Davila
      1096957166: [1, 2, 16], // Sergio Matajira
      1090484563: [1, 16], // Karen Barbosa
      13741590: [1, 2, 16], // Juan Calderon
      63368988: [1, 2, 4, 16], // Liliana Ferreira
      91525308: [1, 2, 4, 16], // Elkin Velasquez
      1014178302: [1, 2, 4, 16], // Nelson Diaz
      1098739531: [2, 8], // Andrea Parra
      1095809978: [2, 8], // Joseph Muñoz
      91297508: [2, 4, 7], // Wilson Fiallo
      91510897: [3, 4, 5, 17, 20], // Cesar Dominguez
      1007421380: [3, 4, 5, 17, 20], // Sergio Hernandez
      1093736472: [8], // Lorena Leon
      1095816177: [9], // Daniela Uribe
      79984087: [10], // Oscar Tapias
      1091655270: [10, 15, 17, 20], // Eneida Perez
      1098625558: [11], // Nathalia Ramirez
      1099367783: [4, 12], // Erika Aguilar
      1128465895: [13], // Jaime Andres
      1099372035: [14], // Darly Cadena
      1004967243: [17], // Ingrid Garzon
      1093791359: [15], // Estefany Quintero
      1090497067: [10, 13, 17, 20, 15], // Heidy Forero
      37579713: [1, 2], // Irene Rueda
      63541030: [2], // Daysy Uribe
    };

    const jefes_todos: number[] = [
      1094241876, // Gabriel Burgos
      79145617, // Jorge Franco
      1092338001, // Andrea Ramirez
      1098679322, // Daniel Felipe Gonzalez
      63289710, // Yolanda Quintero
      63369607, // Azucena Franco
      91298113, // Orlando Duran
      28070692, // Diana Hernandez
    ];

    const tipos = { ...tipos_salidas };

    if (nitJefe !== 63369607) {
      delete tipos[18];
    }

    const esJefeTodos = jefes_todos.includes(nitJefe);

    if (!esJefeTodos && !jefes_tipos_salidas[nitJefe]) {
      // Si no está configurado, no devolver nada explícitamente
      return [];
    }

    if (esJefeTodos) {
      return Object.entries(tipos).map(([id, descripcion]) => ({
        id: Number(id),
        descripcion,
      }));
    }

    const ids = jefes_tipos_salidas[nitJefe];

    return ids.map((id) => ({
      id,
      descripcion: tipos[id],
    }));
  }
}
