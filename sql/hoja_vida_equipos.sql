-- Hoja de vida estructurada de equipos (módulo Mantenimiento)
-- Ejecutar en SQL Server (BD Postventa). Nullable = compatible con equipos legacy.
-- Sin FKs formales (convención del proyecto); unir por id_equipo en JOINs.

-- Extensión de postv_equipos
IF COL_LENGTH('dbo.postv_equipos', 'fabricante') IS NULL
BEGIN
  ALTER TABLE dbo.postv_equipos ADD
    fabricante               varchar(150)  NULL,
    modelo                   varchar(150)  NULL,
    marca                    varchar(150)  NULL,
    ubicacion                varchar(150)  NULL,
    sector                   varchar(100)  NULL,
    descripcion              nvarchar(max) NULL,
    periodo_mtto_preventivo  varchar(50)   NULL,
    imagen_equipo            varchar(150)  NULL,
    dist_nombre              varchar(150)  NULL,
    dist_direccion           varchar(250)  NULL,
    dist_telefono            varchar(100)  NULL,
    dist_ciudad              varchar(100)  NULL,
    dist_departamento        varchar(100)  NULL,
    dist_redes_sociales      varchar(500)  NULL;
END
GO

-- Datos técnicos (0..1 por equipo)
IF OBJECT_ID('dbo.postv_equipos_datos_tecnicos', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.postv_equipos_datos_tecnicos (
    id_equipo                bigint       NOT NULL PRIMARY KEY,
    alimentacion             varchar(100) NULL,
    frecuencia_alimentacion  varchar(100) NULL,
    anio_fabricacion         varchar(20)  NULL,
    numero_serie             varchar(100) NULL,
    potencia_consumo         varchar(100) NULL,
    peso                     varchar(50)  NULL,
    revolucion               varchar(100) NULL
  );
END
GO

-- Datos hidráulicos (0..1 por equipo)
IF OBJECT_ID('dbo.postv_equipos_datos_hidraulicos', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.postv_equipos_datos_hidraulicos (
    id_equipo                bigint       NOT NULL PRIMARY KEY,
    capacidad_litros         varchar(50)  NULL,
    capacidad_carga_tn       varchar(50)  NULL,
    tipo_aceite              varchar(100) NULL,
    capacidad_maxima_carga   varchar(100) NULL
  );
END
GO

-- Listas (N por equipo)
IF OBJECT_ID('dbo.postv_equipos_elementos', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.postv_equipos_elementos (
    id         bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_equipo  bigint NOT NULL,
    orden      int NOT NULL,
    texto      nvarchar(500) NOT NULL
  );
  CREATE INDEX IX_equipos_elementos_equipo ON dbo.postv_equipos_elementos(id_equipo, orden);
END
GO

IF OBJECT_ID('dbo.postv_equipos_recomendaciones', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.postv_equipos_recomendaciones (
    id         bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_equipo  bigint NOT NULL,
    orden      int NOT NULL,
    texto      nvarchar(max) NOT NULL
  );
  CREATE INDEX IX_equipos_recomendaciones_equipo ON dbo.postv_equipos_recomendaciones(id_equipo, orden);
END
GO

IF OBJECT_ID('dbo.postv_equipos_mtto_operativo', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.postv_equipos_mtto_operativo (
    id         bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_equipo  bigint NOT NULL,
    orden      int NOT NULL,
    texto      nvarchar(max) NOT NULL
  );
  CREATE INDEX IX_equipos_mtto_operativo_equipo ON dbo.postv_equipos_mtto_operativo(id_equipo, orden);
END
GO
