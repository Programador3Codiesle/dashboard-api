/**
 * Subconsultas estáticas equivalentes a Informe.php (SQL Server).
 * Se usan con Prisma.raw solo como fragmento interno confiable; los filtros van parametrizados fuera.
 */
export const INNER_P_STANDARD = `
SELECT DISTINCT s.tipo, s.segmento, tipo_vh,
  p0_12 = CASE WHEN grupo = 'p0_12' THEN ISNULL(COUNT(codigo), 0) END,
  p13_24 = CASE WHEN grupo = 'p13_24' THEN ISNULL(COUNT(codigo), 0) END,
  p25_36 = CASE WHEN grupo = 'p25_36' THEN ISNULL(COUNT(codigo), 0) END,
  p37_48 = CASE WHEN grupo = 'p37_48' THEN ISNULL(COUNT(codigo), 0) END,
  p49_60 = CASE WHEN grupo = 'p49_60' THEN ISNULL(COUNT(codigo), 0) END,
  p61_72 = CASE WHEN grupo = 'p61_72' THEN ISNULL(COUNT(codigo), 0) END,
  e_0_12 = CASE WHEN grupo = 'p0_12' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_13_24 = CASE WHEN grupo = 'p13_24' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_25_36 = CASE WHEN grupo = 'p25_36' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_37_48 = CASE WHEN grupo = 'p37_48' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_49_60 = CASE WHEN grupo = 'p49_60' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_61_72 = CASE WHEN grupo = 'p61_72' THEN ISNULL(SUM(ultima_entrada), 0) END
FROM postv_segmento_vh s
LEFT JOIN (
  SELECT tipo, segmento, codigo, tipo_vh, ultima_entrada, b.familia,
    grupo = CASE
      WHEN Meses <= 12 THEN 'p0_12'
      WHEN Meses BETWEEN 13 AND 24 THEN 'p13_24'
      WHEN Meses BETWEEN 25 AND 36 THEN 'p25_36'
      WHEN Meses BETWEEN 37 AND 48 THEN 'p37_48'
      WHEN Meses BETWEEN 49 AND 60 THEN 'p49_60'
      ELSE 'p61_72'
    END
  FROM v_datos_retencion_flotas a
  INNER JOIN vh_familias b ON a.familia = b.descripcion
) f ON s.tipo = f.tipo AND s.segmento = f.segmento AND s.familia = f.familia
WHERE tipo_vh IS NOT NULL
GROUP BY s.tipo, s.segmento, grupo, tipo_vh
`;

export const INNER_P_FAMILIA = `
SELECT DISTINCT s.tipo, s.segmento, tipo_vh, familia_vh,
  p_0_12 = CASE WHEN grupo = 'p_0_12' THEN ISNULL(COUNT(codigo), 0) END,
  p_13_24 = CASE WHEN grupo = 'p_13_24' THEN ISNULL(COUNT(codigo), 0) END,
  p_25_36 = CASE WHEN grupo = 'p_25_36' THEN ISNULL(COUNT(codigo), 0) END,
  p_37_48 = CASE WHEN grupo = 'p_37_48' THEN ISNULL(COUNT(codigo), 0) END,
  p_49_60 = CASE WHEN grupo = 'p_49_60' THEN ISNULL(COUNT(codigo), 0) END,
  p_61_72 = CASE WHEN grupo = 'p_61_72' THEN ISNULL(COUNT(codigo), 0) END,
  e_0_12 = CASE WHEN grupo = 'p_0_12' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_13_24 = CASE WHEN grupo = 'p_13_24' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_25_36 = CASE WHEN grupo = 'p_25_36' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_37_48 = CASE WHEN grupo = 'p_37_48' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_49_60 = CASE WHEN grupo = 'p_49_60' THEN ISNULL(SUM(ultima_entrada), 0) END,
  e_61_72 = CASE WHEN grupo = 'p_61_72' THEN ISNULL(SUM(ultima_entrada), 0) END
FROM postv_segmento_vh s
LEFT JOIN (
  SELECT tipo, segmento, codigo, tipo_vh, ultima_entrada, b.familia, a.familia AS familia_vh,
    grupo = CASE
      WHEN Meses <= 12 THEN 'p_0_12'
      WHEN Meses BETWEEN 13 AND 24 THEN 'p_13_24'
      WHEN Meses BETWEEN 25 AND 36 THEN 'p_25_36'
      WHEN Meses BETWEEN 37 AND 48 THEN 'p_37_48'
      WHEN Meses BETWEEN 49 AND 60 THEN 'p_49_60'
      ELSE 'p_61_72'
    END
  FROM v_datos_retencion_flotas a
  INNER JOIN vh_familias b ON a.familia = b.descripcion
) f ON s.tipo = f.tipo AND s.segmento = f.segmento AND s.familia = f.familia
WHERE tipo_vh IS NOT NULL
GROUP BY s.tipo, s.segmento, grupo, tipo_vh, familia_vh
`;
