-- ============================================================
--  FIX — Roles de Investigador y Médico en Reclutamiento
--  Ejecutar DESPUÉS de seed_reclutamiento.sql
--
--  Problema 1: Los protocolos usados en el seed no tienen
--              id_investigador = 9, por lo que el investigador
--              no ve ninguna postulación.
--
--  Problema 2: El médico (ID=11) no está asignado a ningún
--              centro, por lo que el backend lanza excepción
--              al intentar cargar su vista.
-- ============================================================

DO $$
DECLARE
  v_protocolo1 INT;
  v_protocolo2 INT;
  v_centro1    INT;

  v_invest_id INT := 9;
  v_medico_id INT := 11;
BEGIN

  -- ── 1. Obtener los mismos protocolos que usó el seed ─────
  SELECT id_protocolo INTO v_protocolo1
  FROM protocolo ORDER BY id_protocolo LIMIT 1;

  SELECT id_protocolo INTO v_protocolo2
  FROM protocolo ORDER BY id_protocolo OFFSET 1 LIMIT 1;
  IF v_protocolo2 IS NULL THEN v_protocolo2 := v_protocolo1; END IF;

  -- ── 2. Asignar investigador=9 a esos protocolos ──────────
  UPDATE protocolo
  SET id_investigador = v_invest_id
  WHERE id_protocolo IN (v_protocolo1, v_protocolo2);

  RAISE NOTICE 'Protocolos % y % actualizados con id_investigador = %',
    v_protocolo1, v_protocolo2, v_invest_id;

  -- ── 3. Obtener el primer centro activo ───────────────────
  SELECT id_centro INTO v_centro1
  FROM centro_investigacion WHERE activo = true ORDER BY id_centro LIMIT 1;

  IF v_centro1 IS NULL THEN
    RAISE EXCEPTION 'No hay centros activos en la BD.';
  END IF;

  -- ── 4. Asignar médico=11 al centro (ON CONFLICT ignora si ya existe) ─
  INSERT INTO usuario_centro (id_usuario, id_centro, fecha_asignacion)
  VALUES (v_medico_id, v_centro1, CURRENT_DATE)
  ON CONFLICT (id_usuario, id_centro) DO NOTHING;

  RAISE NOTICE 'Médico % asignado al centro %', v_medico_id, v_centro1;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Fix aplicado correctamente';
  RAISE NOTICE '  Investigador ID=% → protocolos % y %', v_invest_id, v_protocolo1, v_protocolo2;
  RAISE NOTICE '  Médico       ID=% → centro %',         v_medico_id, v_centro1;

END $$;
