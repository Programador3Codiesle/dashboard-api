-- Añadir columna id_empresa a postv_ausentismos (ejecutar manualmente si la tabla no la tiene)
-- Ejemplo SQL Server:
-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('postv_ausentismos') AND name = 'id_empresa')
--   ALTER TABLE postv_ausentismos ADD id_empresa INT NULL;

ALTER TABLE postv_ausentismos ADD id_empresa INT NULL;
