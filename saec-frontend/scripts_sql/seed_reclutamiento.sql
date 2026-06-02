-- ============================================================
--  DATOS DE PRUEBA — Módulo Reclutamiento SGEC
--  Coordinador ID=10 | Investigador ID=9 | Médico ID=11
-- ============================================================

DO $$
DECLARE
  v_genero_m   INT;
  v_genero_f   INT;
  v_estado_esp INT;
  v_estado_ace INT;
  v_estado_rec INT;
  v_centro1    INT;
  v_centro2    INT;
  v_protocolo1 INT;
  v_protocolo2 INT;

  -- IDs fijos según los usuarios reales
  v_coord_id  INT := 10;
  v_invest_id INT := 9;
  v_medico_id INT := 11;

  c1 INT; c2 INT; c3 INT; c4 INT;
  c5 INT; c6 INT; c7 INT; c8 INT;
  p1 INT; p2 INT; p3 INT; p4 INT;
  p5 INT; p6 INT; p7 INT; p8 INT;

BEGIN

  -- ── 1. CATÁLOGOS ──────────────────────────────────────────

  INSERT INTO cat_genero (nombre)
  VALUES ('Masculino'), ('Femenino'), ('Otro')
  ON CONFLICT DO NOTHING;

  SELECT id_genero INTO v_genero_m FROM cat_genero WHERE nombre = 'Masculino' LIMIT 1;
  SELECT id_genero INTO v_genero_f FROM cat_genero WHERE nombre = 'Femenino'  LIMIT 1;

  INSERT INTO cat_estado_postulacion (nombre)
  VALUES ('En Espera'), ('Aceptado'), ('Rechazado')
  ON CONFLICT DO NOTHING;

  SELECT id_estado INTO v_estado_esp FROM cat_estado_postulacion WHERE nombre = 'En Espera' LIMIT 1;
  SELECT id_estado INTO v_estado_ace FROM cat_estado_postulacion WHERE nombre = 'Aceptado'  LIMIT 1;
  SELECT id_estado INTO v_estado_rec FROM cat_estado_postulacion WHERE nombre = 'Rechazado' LIMIT 1;

  -- ── 2. REFERENCIAS (centro y protocolo dinámicos) ─────────

  SELECT id_centro INTO v_centro1
  FROM centro_investigacion WHERE activo = true ORDER BY id_centro LIMIT 1;

  SELECT id_centro INTO v_centro2
  FROM centro_investigacion WHERE activo = true ORDER BY id_centro OFFSET 1 LIMIT 1;
  IF v_centro2 IS NULL THEN v_centro2 := v_centro1; END IF;

  SELECT id_protocolo INTO v_protocolo1
  FROM protocolo ORDER BY id_protocolo LIMIT 1;

  SELECT id_protocolo INTO v_protocolo2
  FROM protocolo ORDER BY id_protocolo OFFSET 1 LIMIT 1;
  IF v_protocolo2 IS NULL THEN v_protocolo2 := v_protocolo1; END IF;

  IF v_centro1    IS NULL THEN RAISE EXCEPTION 'No hay centros activos en la BD.'; END IF;
  IF v_protocolo1 IS NULL THEN RAISE EXCEPTION 'No hay protocolos en la BD.'; END IF;

  -- ── 3. CANDIDATOS ─────────────────────────────────────────

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1, v_genero_m, 'CAND-2025-001', 'Carlos',    'Mendoza',   '+56 9 1234 5678', '1985-03-12', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c1;
  IF c1 IS NULL THEN SELECT id_candidato INTO c1 FROM candidato WHERE codigo_anonimo = 'CAND-2025-001'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1, v_genero_f, 'CAND-2025-002', 'María',     'González',  '+56 9 2345 6789', '1990-07-22', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c2;
  IF c2 IS NULL THEN SELECT id_candidato INTO c2 FROM candidato WHERE codigo_anonimo = 'CAND-2025-002'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro2, v_genero_m, 'CAND-2025-003', 'Roberto',   'Herrera',   '+56 9 3456 7890', '1978-11-05', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c3;
  IF c3 IS NULL THEN SELECT id_candidato INTO c3 FROM candidato WHERE codigo_anonimo = 'CAND-2025-003'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro2, v_genero_f, 'CAND-2025-004', 'Valentina', 'Castro',    '+56 9 4567 8901', '1995-02-18', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c4;
  IF c4 IS NULL THEN SELECT id_candidato INTO c4 FROM candidato WHERE codigo_anonimo = 'CAND-2025-004'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1, v_genero_f, 'CAND-2025-005', 'Sofía',     'Ramírez',   '+56 9 5678 9012', '1988-09-30', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c5;
  IF c5 IS NULL THEN SELECT id_candidato INTO c5 FROM candidato WHERE codigo_anonimo = 'CAND-2025-005'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1, v_genero_m, 'CAND-2025-006', 'Diego',     'Morales',   '+56 9 6789 0123', '1982-06-14', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c6;
  IF c6 IS NULL THEN SELECT id_candidato INTO c6 FROM candidato WHERE codigo_anonimo = 'CAND-2025-006'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro2, v_genero_f, 'CAND-2025-007', 'Camila',    'Torres',    '+56 9 7890 1234', '1993-12-08', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c7;
  IF c7 IS NULL THEN SELECT id_candidato INTO c7 FROM candidato WHERE codigo_anonimo = 'CAND-2025-007'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido, contacto, fecha_nacimiento, created_at)
  VALUES (v_centro2, v_genero_m, 'CAND-2025-008', 'Andrés',    'Fernández', '+56 9 8901 2345', '1975-04-27', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c8;
  IF c8 IS NULL THEN SELECT id_candidato INTO c8 FROM candidato WHERE codigo_anonimo = 'CAND-2025-008'; END IF;

  -- ── 4. POSTULACIONES ──────────────────────────────────────
  --  p1-p3, p8 → En Espera   (investigador ID=9 puede aprobar/rechazar)
  --  p4, p5    → Aceptado    (médico ID=11 puede evaluar)
  --  p6, p7    → Rechazado   (historial)

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c1, v_protocolo1, v_coord_id, v_estado_esp,
          NULL, 'Candidato referido por médico de cabecera. Cumple criterios clínicos básicos.',
          NOW() - INTERVAL '5 days', NULL)
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p1;
  IF p1 IS NULL THEN SELECT id_postulacion INTO p1 FROM postulacion WHERE id_candidato=c1 AND id_protocolo=v_protocolo1; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c2, v_protocolo1, v_coord_id, v_estado_esp,
          true, 'Paciente joven sin comorbilidades. Cumple todos los criterios de inclusión.',
          NOW() - INTERVAL '3 days', NULL)
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p2;
  IF p2 IS NULL THEN SELECT id_postulacion INTO p2 FROM postulacion WHERE id_candidato=c2 AND id_protocolo=v_protocolo1; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c3, v_protocolo2, v_coord_id, v_estado_esp,
          false, 'Antecedente de hipertensión. Revisar criterios de exclusión.',
          NOW() - INTERVAL '1 day', NULL)
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p3;
  IF p3 IS NULL THEN SELECT id_postulacion INTO p3 FROM postulacion WHERE id_candidato=c3 AND id_protocolo=v_protocolo2; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c4, v_protocolo1, v_coord_id, v_estado_ace,
          true, 'Candidata en excelente estado de salud general.',
          NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p4;
  IF p4 IS NULL THEN SELECT id_postulacion INTO p4 FROM postulacion WHERE id_candidato=c4 AND id_protocolo=v_protocolo1; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c5, v_protocolo2, v_coord_id, v_estado_ace,
          true, NULL,
          NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p5;
  IF p5 IS NULL THEN SELECT id_postulacion INTO p5 FROM postulacion WHERE id_candidato=c5 AND id_protocolo=v_protocolo2; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c6, v_protocolo1, v_coord_id, v_estado_rec,
          false, 'Candidato con múltiples comorbilidades cardiovasculares.',
          NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p6;
  IF p6 IS NULL THEN SELECT id_postulacion INTO p6 FROM postulacion WHERE id_candidato=c6 AND id_protocolo=v_protocolo1; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c7, v_protocolo2, v_coord_id, v_estado_rec,
          NULL, NULL,
          NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p7;
  IF p7 IS NULL THEN SELECT id_postulacion INTO p7 FROM postulacion WHERE id_candidato=c7 AND id_protocolo=v_protocolo2; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c8, v_protocolo2, v_coord_id, v_estado_esp,
          NULL, 'Paciente mayor, requiere evaluación exhaustiva de criterios.',
          NOW() - INTERVAL '2 hours', NULL)
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p8;
  IF p8 IS NULL THEN SELECT id_postulacion INTO p8 FROM postulacion WHERE id_candidato=c8 AND id_protocolo=v_protocolo2; END IF;

  -- ── 5. HISTORIAL DE CAMBIOS ───────────────────────────────
  --  Registro inicial de todos (coordinador ID=10)

  INSERT INTO postulacion_modificacion
    (id_postulacion, id_usuario, estado_anterior, estado_nuevo, motivo, es_override, fecha_modificacion)
  VALUES
    (p1, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '5 days'),
    (p2, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '3 days'),
    (p3, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '1 day'),
    (p4, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '10 days'),
    (p5, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '8 days'),
    (p6, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '15 days'),
    (p7, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '20 days'),
    (p8, v_coord_id, NULL, v_estado_esp, NULL, false, NOW() - INTERVAL '2 hours');

  --  Decisiones del investigador ID=9
  INSERT INTO postulacion_modificacion
    (id_postulacion, id_usuario, estado_anterior, estado_nuevo, motivo, es_override, fecha_modificacion)
  VALUES
    (p4, v_invest_id, v_estado_esp, v_estado_ace,
     NULL,
     false, NOW() - INTERVAL '7 days'),
    (p5, v_invest_id, v_estado_esp, v_estado_ace,
     NULL,
     false, NOW() - INTERVAL '5 days'),
    (p6, v_invest_id, v_estado_esp, v_estado_rec,
     'Contraindicaciones absolutas. Antecedente cardiovascular severo incompatible con el protocolo.',
     false, NOW() - INTERVAL '12 days'),
    (p7, v_invest_id, v_estado_esp, v_estado_rec,
     'Paciente no cumple criterio de edad mínima requerida por el protocolo.',
     false, NOW() - INTERVAL '18 days');

  RAISE NOTICE '';
  RAISE NOTICE '✅ Script ejecutado correctamente';
  RAISE NOTICE '-------------------------------------';
  RAISE NOTICE '  Coordinador  → ID = %', v_coord_id;
  RAISE NOTICE '  Investigador → ID = %', v_invest_id;
  RAISE NOTICE '  Médico       → ID = %', v_medico_id;
  RAISE NOTICE '  Centro 1: %  | Centro 2: %', v_centro1, v_centro2;
  RAISE NOTICE '  Protocolo 1: % | Protocolo 2: %', v_protocolo1, v_protocolo2;
  RAISE NOTICE '-------------------------------------';
  RAISE NOTICE '  Candidatos insertados: 8';
  RAISE NOTICE '  En Espera : CAND-001, 002, 003, 008  (investigador puede decidir)';
  RAISE NOTICE '  Aceptados : CAND-004, 005             (médico puede evaluar)';
  RAISE NOTICE '  Rechazados: CAND-006, 007             (aparecen en historial)';

END $$;
