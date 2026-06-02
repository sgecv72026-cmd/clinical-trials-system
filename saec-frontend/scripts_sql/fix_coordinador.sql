-- ============================================================
--  FIX — Asignar todas las postulaciones existentes al
--         coordinador ID=10 para que las vea en su módulo
--
--  Ejecutar en pgAdmin → Query Tool
-- ============================================================

-- Actualiza TODAS las postulaciones para que el coordinador
-- ID=10 sea el responsable (independiente de quién las creó)
UPDATE postulacion
SET id_coordinador = 10;

-- Verifica el resultado
SELECT
  p.id_postulacion,
  c.codigo_anonimo,
  c.nombre || ' ' || c.apellido AS candidato,
  p.id_coordinador,
  ep.nombre AS estado
FROM postulacion p
JOIN candidato c ON c.id_candidato = p.id_candidato
JOIN cat_estado_postulacion ep ON ep.id_estado = p.id_estado
ORDER BY p.id_postulacion;
