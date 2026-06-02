-- ============================================================
--  FIX — Asignar médico ID=11 al centro donde hay candidatos
--         con estado "Aceptado" para que pueda verlos
-- ============================================================

DO $$
DECLARE
  v_medico_id  INT := 11;
  v_centro_id  INT;
  v_nombre_centro TEXT;
  v_id_estado_ace INT;
BEGIN

  -- Obtener ID del estado Aceptado
  SELECT id_estado INTO v_id_estado_ace
  FROM cat_estado_postulacion
  WHERE LOWER(nombre) = 'aceptado'
  LIMIT 1;

  IF v_id_estado_ace IS NULL THEN
    RAISE EXCEPTION 'No se encontró el estado "Aceptado" en cat_estado_postulacion';
  END IF;

  RAISE NOTICE 'ID del estado Aceptado: %', v_id_estado_ace;

  -- Buscar el centro donde haya candidatos en estado Aceptado y sin paciente activo
  SELECT c.id_centro INTO v_centro_id
  FROM candidato can
  JOIN postulacion p ON p.id_candidato = can.id_candidato
  JOIN centro_investigacion c ON c.id_centro = can.id_centro
  WHERE p.id_estado = v_id_estado_ace
    AND NOT EXISTS (
      SELECT 1 FROM paciente pac
      WHERE pac.id_candidato = can.id_candidato
        AND pac.activo = true
    )
  LIMIT 1;

  IF v_centro_id IS NULL THEN
    RAISE NOTICE '⚠ No se encontraron candidatos Aceptados sin paciente activo.';
    RAISE NOTICE '  Verifica que los candidatos con estado Aceptado existen.';
    RETURN;
  END IF;

  SELECT nombre INTO v_nombre_centro FROM centro_investigacion WHERE id_centro = v_centro_id;

  -- Eliminar asignaciones anteriores del médico (para reasignar al centro correcto)
  DELETE FROM usuario_centro WHERE id_usuario = v_medico_id;

  -- Asignar médico al centro correcto
  INSERT INTO usuario_centro (id_usuario, id_centro, fecha_asignacion)
  VALUES (v_medico_id, v_centro_id, CURRENT_DATE);

  RAISE NOTICE '✅ Médico ID=% asignado al centro % (%)', v_medico_id, v_centro_id, v_nombre_centro;
  RAISE NOTICE '';
  RAISE NOTICE '-- Candidatos Aceptados en ese centro: --';

END $$;

-- Muestra los candidatos que debería ver el médico
SELECT
  c.codigo_anonimo,
  c.nombre || ' ' || c.apellido AS candidato,
  ci.nombre AS centro,
  ep.nombre AS estado,
  p.fecha_decision
FROM postulacion p
JOIN candidato c ON c.id_candidato = p.id_candidato
JOIN centro_investigacion ci ON ci.id_centro = c.id_centro
JOIN cat_estado_postulacion ep ON ep.id_estado = p.id_estado
WHERE LOWER(ep.nombre) = 'aceptado'
  AND NOT EXISTS (
    SELECT 1 FROM paciente pac
    WHERE pac.id_candidato = c.id_candidato AND pac.activo = true
  )
ORDER BY p.fecha_decision DESC;
