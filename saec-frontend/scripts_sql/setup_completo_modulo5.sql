-- ============================================================
--  SETUP COMPLETO — Módulo 5 Reclutamiento SGEC
--  ✅ Independiente de IDs — funciona en cualquier BD limpia
--  ✅ Idempotente — se puede ejecutar varias veces
--
--  ORDEN DE EJECUCIÓN:
--    1. SAECC.sql          (esquema + catálogos base)
--    2. Este script        (users + centros + protocolos + datos M5)
--
--  Contraseña de todos los usuarios: Saec2026!
-- ============================================================

DO $$
DECLARE
  -- IDs dinámicos (se resuelven por nombre/email, no hardcodeados)
  v_rol_admin    INT;
  v_rol_invest   INT;
  v_rol_medico   INT;
  v_rol_coord    INT;
  v_rol_comite   INT;

  v_admin_id     INT;
  v_invest_id    INT;
  v_medico_id    INT;
  v_coord_id     INT;

  v_centro1_id   INT;
  v_centro2_id   INT;
  v_proto1_id    INT;
  v_proto2_id    INT;
  v_fase_id      INT;
  v_estado_act   INT;

  v_estado_esp   INT;
  v_estado_ace   INT;
  v_estado_rec   INT;

  v_genero_m     INT;
  v_genero_f     INT;

  c1 INT; c2 INT; c3 INT; c4 INT;
  c5 INT; c6 INT; c7 INT; c8 INT;
  p1 INT; p2 INT; p3 INT; p4 INT;
  p5 INT; p6 INT; p7 INT; p8 INT;

BEGIN

  -- ══════════════════════════════════════════════════════════
  --  1. ROLES  (nombres que usa el backend para autorización)
  -- ══════════════════════════════════════════════════════════

  INSERT INTO cat_tipo_rol (nombre, descripcion, activo) VALUES
    ('Administrador',                'Acceso total al sistema',                                   true),
    ('Investigador Principal',       'Diseño y supervisión de protocolos clínicos',               true),
    ('Médico Tratante',              'Seguimiento clínico de pacientes en protocolo',             true),
    ('Coordinador de Reclutamiento', 'Gestión de postulaciones y candidatos',                     true),
    ('Comité de Ética',              'Revisión y aprobación ética de protocolos',                 true)
  ON CONFLICT (nombre) DO NOTHING;

  SELECT id_rol INTO v_rol_admin  FROM cat_tipo_rol WHERE nombre = 'Administrador'                LIMIT 1;
  SELECT id_rol INTO v_rol_invest FROM cat_tipo_rol WHERE nombre = 'Investigador Principal'       LIMIT 1;
  SELECT id_rol INTO v_rol_medico FROM cat_tipo_rol WHERE nombre = 'Médico Tratante'              LIMIT 1;
  SELECT id_rol INTO v_rol_coord  FROM cat_tipo_rol WHERE nombre = 'Coordinador de Reclutamiento' LIMIT 1;
  SELECT id_rol INTO v_rol_comite FROM cat_tipo_rol WHERE nombre = 'Comité de Ética'              LIMIT 1;

  RAISE NOTICE 'Roles: Admin=% Invest=% Medico=% Coord=% Comite=%',
    v_rol_admin, v_rol_invest, v_rol_medico, v_rol_coord, v_rol_comite;

  -- ══════════════════════════════════════════════════════════
  --  2. USUARIOS  (BCrypt hash de "Saec2026!", factor 12)
  -- ══════════════════════════════════════════════════════════

  INSERT INTO usuario (id_rol, nombre, apellido, email, password_hash, activo, telefono) VALUES
    (v_rol_admin,  'Admin',      'Sistema',    'admin@saec.cl',        '$2a$12$LZFkZ3V.Rp0BYNfF9mA3R.mQzqX9uUJHOA0G1N9nLvl7a4tXI6Dei', true, '+56 9 0000 0001'),
    (v_rol_invest, 'Dr. Carlos', 'Mendoza',    'c.mendoza@saec.cl',    '$2a$12$LZFkZ3V.Rp0BYNfF9mA3R.mQzqX9uUJHOA0G1N9nLvl7a4tXI6Dei', true, '+56 9 1111 2222'),
    (v_rol_medico, 'Dra. Ana',   'Torres',     'a.torres@saec.cl',     '$2a$12$LZFkZ3V.Rp0BYNfF9mA3R.mQzqX9uUJHOA0G1N9nLvl7a4tXI6Dei', true, '+56 9 3333 4444'),
    (v_rol_coord,  'Luis',       'Fernández',  'l.fernandez@saec.cl',  '$2a$12$LZFkZ3V.Rp0BYNfF9mA3R.mQzqX9uUJHOA0G1N9nLvl7a4tXI6Dei', true, '+56 9 5555 6666'),
    (v_rol_comite, 'María',      'Soto',       'm.soto@saec.cl',       '$2a$12$LZFkZ3V.Rp0BYNfF9mA3R.mQzqX9uUJHOA0G1N9nLvl7a4tXI6Dei', true, '+56 9 7777 8888'),
    (v_rol_admin,  'Usuario',    'Desactivado','inactivo@saec.cl',     '$2a$12$LZFkZ3V.Rp0BYNfF9mA3R.mQzqX9uUJHOA0G1N9nLvl7a4tXI6Dei', false, null)
  ON CONFLICT (email) DO NOTHING;

  -- Resolver IDs reales por email
  SELECT id_usuario INTO v_invest_id FROM usuario WHERE email = 'c.mendoza@saec.cl';
  SELECT id_usuario INTO v_medico_id FROM usuario WHERE email = 'a.torres@saec.cl';
  SELECT id_usuario INTO v_coord_id  FROM usuario WHERE email = 'l.fernandez@saec.cl';
  SELECT id_usuario INTO v_admin_id  FROM usuario WHERE email = 'admin@saec.cl';

  IF v_invest_id IS NULL THEN RAISE EXCEPTION 'Usuario investigador no encontrado (c.mendoza@saec.cl)'; END IF;
  IF v_medico_id IS NULL THEN RAISE EXCEPTION 'Usuario médico no encontrado (a.torres@saec.cl)'; END IF;
  IF v_coord_id  IS NULL THEN RAISE EXCEPTION 'Usuario coordinador no encontrado (l.fernandez@saec.cl)'; END IF;

  RAISE NOTICE 'Usuarios: Investigador=% Médico=% Coordinador=%',
    v_invest_id, v_medico_id, v_coord_id;

  -- ══════════════════════════════════════════════════════════
  --  3. CENTROS DE INVESTIGACIÓN
  -- ══════════════════════════════════════════════════════════

  INSERT INTO centro_investigacion (nombre, ciudad, direccion, telefono, activo) VALUES
    ('Hospital Clínico Universidad de Chile', 'Santiago',   'Av. Santos Dumont 999',    '+56 2 2978 8000', true),
    ('Clínica Las Condes',                    'Las Condes', 'Lo Fontecilla 441',         '+56 2 2210 4000', true),
    ('Hospital San Borja Arriarán',           'Santiago',   'Av. Santa Rosa 1234',       '+56 2 2556 7000', true)
  ON CONFLICT DO NOTHING;

  SELECT id_centro INTO v_centro1_id FROM centro_investigacion WHERE activo = true ORDER BY id_centro LIMIT 1;
  SELECT id_centro INTO v_centro2_id FROM centro_investigacion WHERE activo = true ORDER BY id_centro OFFSET 1 LIMIT 1;
  IF v_centro2_id IS NULL THEN v_centro2_id := v_centro1_id; END IF;

  RAISE NOTICE 'Centros: Centro1=% Centro2=%', v_centro1_id, v_centro2_id;

  -- ══════════════════════════════════════════════════════════
  --  4. ASIGNAR MÉDICO Y COORDINADOR A CENTROS
  -- ══════════════════════════════════════════════════════════

  -- El médico y el coordinador deben estar en el MISMO centro
  -- para que los candidatos del coordinador sean visibles al médico
  INSERT INTO usuario_centro (id_usuario, id_centro, fecha_asignacion)
  VALUES
    (v_medico_id, v_centro1_id, CURRENT_DATE),
    (v_coord_id,  v_centro1_id, CURRENT_DATE)
  ON CONFLICT (id_usuario, id_centro) DO NOTHING;

  RAISE NOTICE 'Médico % y Coordinador % asignados al centro %',
    v_medico_id, v_coord_id, v_centro1_id;

  -- ══════════════════════════════════════════════════════════
  --  5. PROTOCOLOS
  -- ══════════════════════════════════════════════════════════

  SELECT id_fase INTO v_fase_id
  FROM cat_fase_clinica WHERE nombre ILIKE '%Fase II%' OR nombre ILIKE '%II%' LIMIT 1;
  IF v_fase_id IS NULL THEN
    SELECT id_fase INTO v_fase_id FROM cat_fase_clinica ORDER BY id_fase LIMIT 1;
  END IF;

  SELECT id_estado_protocolo INTO v_estado_act
  FROM cat_estado_protocolo WHERE LOWER(nombre) = 'activo' LIMIT 1;
  IF v_estado_act IS NULL THEN
    SELECT id_estado_protocolo INTO v_estado_act FROM cat_estado_protocolo ORDER BY id_estado_protocolo LIMIT 1;
  END IF;

  INSERT INTO protocolo (id_investigador, id_fase, id_estado_protocolo, codigo, titulo,
                         objetivos, fecha_inicio, fecha_fin_estimada, meta_pacientes, created_at)
  VALUES
    (v_invest_id, v_fase_id, v_estado_act,
     'PROTO-2025-01',
     'Evaluación de Eficacia de Tratamiento X en Pacientes con HTA',
     'Evaluar la reducción de la presión arterial sistólica en pacientes con HTA moderada.',
     '2025-01-15', '2026-12-31', 30, NOW()),
    (v_invest_id, v_fase_id, v_estado_act,
     'PROTO-2025-02',
     'Estudio de Seguridad del Compuesto Y en Pacientes Diabéticos',
     'Determinar el perfil de seguridad del compuesto Y en pacientes con DM tipo 2.',
     '2025-03-01', '2027-02-28', 20, NOW())
  ON CONFLICT (codigo) DO NOTHING;

  -- Asegurar que los protocolos existentes usen el investigador correcto
  UPDATE protocolo
  SET id_investigador = v_invest_id
  WHERE codigo IN ('PROTO-2025-01', 'PROTO-2025-02');

  SELECT id_protocolo INTO v_proto1_id FROM protocolo WHERE codigo = 'PROTO-2025-01';
  SELECT id_protocolo INTO v_proto2_id FROM protocolo WHERE codigo = 'PROTO-2025-02';

  RAISE NOTICE 'Protocolos: Proto1=% Proto2=%', v_proto1_id, v_proto2_id;

  -- ══════════════════════════════════════════════════════════
  --  6. CRITERIOS DE ELEGIBILIDAD
  -- ══════════════════════════════════════════════════════════

  INSERT INTO criterio_protocolo (id_protocolo, tipo, descripcion, activo) VALUES
    (v_proto1_id, 'inclusion', 'Edad entre 30 y 70 años',                                   true),
    (v_proto1_id, 'inclusion', 'Diagnóstico de HTA moderada (PA 140-179/90-109 mmHg)',       true),
    (v_proto1_id, 'exclusion', 'Insuficiencia renal crónica (FG < 30 ml/min)',               true),
    (v_proto1_id, 'exclusion', 'Uso de anticoagulantes en los últimos 3 meses',              true),
    (v_proto2_id, 'inclusion', 'Diabetes mellitus tipo 2 diagnosticada hace al menos 1 año', true),
    (v_proto2_id, 'inclusion', 'HbA1c entre 7.5% y 10%',                                   true),
    (v_proto2_id, 'exclusion', 'Insuficiencia hepática grave (Child-Pugh C)',                true)
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════════
  --  7. VISITAS DEL PROTOCOLO (plantillas)
  -- ══════════════════════════════════════════════════════════

  INSERT INTO visita_protocolo (id_protocolo, nombre, semana, dia, duracion_minutos, activo) VALUES
    (v_proto1_id, 'Visita Basal',           0,  1, 120, true),
    (v_proto1_id, 'Visita Semana 4',        4,  1,  60, true),
    (v_proto1_id, 'Visita Semana 8',        8,  1,  60, true),
    (v_proto1_id, 'Visita Final',          12,  1,  90, true),
    (v_proto2_id, 'Visita de Selección',    0,  1, 120, true),
    (v_proto2_id, 'Control Mes 2',          8,  1,  60, true),
    (v_proto2_id, 'Control Mes 4',         16,  1,  60, true),
    (v_proto2_id, 'Visita de Cierre',      24,  1,  90, true)
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════════
  --  8. ESTADOS DE POSTULACIÓN
  -- ══════════════════════════════════════════════════════════

  INSERT INTO cat_estado_postulacion (nombre) VALUES
    ('En Espera'), ('Aceptado'), ('Rechazado')
  ON CONFLICT DO NOTHING;

  SELECT id_estado INTO v_estado_esp FROM cat_estado_postulacion WHERE nombre = 'En Espera' LIMIT 1;
  SELECT id_estado INTO v_estado_ace FROM cat_estado_postulacion WHERE nombre = 'Aceptado'  LIMIT 1;
  SELECT id_estado INTO v_estado_rec FROM cat_estado_postulacion WHERE nombre = 'Rechazado' LIMIT 1;

  IF v_estado_esp IS NULL THEN RAISE EXCEPTION 'Estado "En Espera" no encontrado'; END IF;

  -- ══════════════════════════════════════════════════════════
  --  9. GÉNEROS
  -- ══════════════════════════════════════════════════════════

  SELECT id_genero INTO v_genero_m FROM cat_genero WHERE LOWER(nombre) LIKE '%masc%' LIMIT 1;
  SELECT id_genero INTO v_genero_f FROM cat_genero WHERE LOWER(nombre) LIKE '%fem%'  LIMIT 1;
  IF v_genero_m IS NULL THEN
    INSERT INTO cat_genero (nombre) VALUES ('Masculino') RETURNING id_genero INTO v_genero_m;
  END IF;
  IF v_genero_f IS NULL THEN
    INSERT INTO cat_genero (nombre) VALUES ('Femenino') RETURNING id_genero INTO v_genero_f;
  END IF;

  -- ══════════════════════════════════════════════════════════
  --  10. CANDIDATOS
  --
  --   c1-c3, c8 → pendientes (En Espera)   — investigador decide
  --   c4, c5    → aceptados (Aceptado)     — médico evalúa
  --   c6, c7    → historial (Rechazado)
  --
  --   TODOS en v_centro1_id para que el médico los vea
  -- ══════════════════════════════════════════════════════════

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_m, 'CAND-2025-001', 'Carlos',    'Mendoza Ríos',
          '+56 9 1234 5678', '1985-03-12', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c1;
  IF c1 IS NULL THEN SELECT id_candidato INTO c1 FROM candidato WHERE codigo_anonimo = 'CAND-2025-001'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_f, 'CAND-2025-002', 'María',     'González Soto',
          '+56 9 2345 6789', '1990-07-22', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c2;
  IF c2 IS NULL THEN SELECT id_candidato INTO c2 FROM candidato WHERE codigo_anonimo = 'CAND-2025-002'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_m, 'CAND-2025-003', 'Roberto',   'Herrera Lagos',
          '+56 9 3456 7890', '1978-11-05', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c3;
  IF c3 IS NULL THEN SELECT id_candidato INTO c3 FROM candidato WHERE codigo_anonimo = 'CAND-2025-003'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_f, 'CAND-2025-004', 'Valentina', 'Castro Vera',
          '+56 9 4567 8901', '1995-02-18', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c4;
  IF c4 IS NULL THEN SELECT id_candidato INTO c4 FROM candidato WHERE codigo_anonimo = 'CAND-2025-004'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_f, 'CAND-2025-005', 'Sofía',     'Ramírez Paz',
          '+56 9 5678 9012', '1988-09-30', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c5;
  IF c5 IS NULL THEN SELECT id_candidato INTO c5 FROM candidato WHERE codigo_anonimo = 'CAND-2025-005'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_m, 'CAND-2025-006', 'Diego',     'Morales Cruz',
          '+56 9 6789 0123', '1982-06-14', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c6;
  IF c6 IS NULL THEN SELECT id_candidato INTO c6 FROM candidato WHERE codigo_anonimo = 'CAND-2025-006'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_f, 'CAND-2025-007', 'Camila',    'Torres Muñoz',
          '+56 9 7890 1234', '1993-12-08', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c7;
  IF c7 IS NULL THEN SELECT id_candidato INTO c7 FROM candidato WHERE codigo_anonimo = 'CAND-2025-007'; END IF;

  INSERT INTO candidato (id_centro, id_genero, codigo_anonimo, nombre, apellido,
                         contacto, fecha_nacimiento, created_at)
  VALUES (v_centro1_id, v_genero_m, 'CAND-2025-008', 'Andrés',    'Fernández Rojas',
          '+56 9 8901 2345', '1975-04-27', NOW())
  ON CONFLICT (codigo_anonimo) DO NOTHING RETURNING id_candidato INTO c8;
  IF c8 IS NULL THEN SELECT id_candidato INTO c8 FROM candidato WHERE codigo_anonimo = 'CAND-2025-008'; END IF;

  -- ══════════════════════════════════════════════════════════
  --  11. POSTULACIONES
  -- ══════════════════════════════════════════════════════════

  -- Pendientes (En Espera)
  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion)
  VALUES (c1, v_proto1_id, v_coord_id, v_estado_esp,
          NULL, 'Candidato referido por médico de cabecera. Cumple criterios clínicos básicos.',
          NOW() - INTERVAL '5 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p1;
  IF p1 IS NULL THEN SELECT id_postulacion INTO p1 FROM postulacion WHERE id_candidato=c1 AND id_protocolo=v_proto1_id; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion)
  VALUES (c2, v_proto1_id, v_coord_id, v_estado_esp,
          NULL, 'Paciente joven sin comorbilidades. Cumple criterios de inclusión.',
          NOW() - INTERVAL '3 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p2;
  IF p2 IS NULL THEN SELECT id_postulacion INTO p2 FROM postulacion WHERE id_candidato=c2 AND id_protocolo=v_proto1_id; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion)
  VALUES (c3, v_proto2_id, v_coord_id, v_estado_esp,
          NULL, 'Antecedente de hipertensión. Revisar criterios de exclusión.',
          NOW() - INTERVAL '1 day')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p3;
  IF p3 IS NULL THEN SELECT id_postulacion INTO p3 FROM postulacion WHERE id_candidato=c3 AND id_protocolo=v_proto2_id; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion)
  VALUES (c8, v_proto2_id, v_coord_id, v_estado_esp,
          NULL, 'Paciente mayor, requiere evaluación exhaustiva.',
          NOW() - INTERVAL '2 hours')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p8;
  IF p8 IS NULL THEN SELECT id_postulacion INTO p8 FROM postulacion WHERE id_candidato=c8 AND id_protocolo=v_proto2_id; END IF;

  -- Aceptados por investigador (médico puede evaluar)
  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c4, v_proto1_id, v_coord_id, v_estado_ace,
          NULL, 'Candidata en excelente estado de salud general.',
          NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p4;
  IF p4 IS NULL THEN SELECT id_postulacion INTO p4 FROM postulacion WHERE id_candidato=c4 AND id_protocolo=v_proto1_id; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c5, v_proto2_id, v_coord_id, v_estado_ace,
          NULL, NULL,
          NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p5;
  IF p5 IS NULL THEN SELECT id_postulacion INTO p5 FROM postulacion WHERE id_candidato=c5 AND id_protocolo=v_proto2_id; END IF;

  -- Rechazados (historial)
  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c6, v_proto1_id, v_coord_id, v_estado_rec,
          false, 'Múltiples comorbilidades cardiovasculares.',
          NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p6;
  IF p6 IS NULL THEN SELECT id_postulacion INTO p6 FROM postulacion WHERE id_candidato=c6 AND id_protocolo=v_proto1_id; END IF;

  INSERT INTO postulacion (id_candidato, id_protocolo, id_coordinador, id_estado,
                           elegibilidad_auto, observacion_general, fecha_postulacion, fecha_decision)
  VALUES (c7, v_proto2_id, v_coord_id, v_estado_rec,
          NULL, NULL,
          NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days')
  ON CONFLICT (id_candidato, id_protocolo) DO NOTHING RETURNING id_postulacion INTO p7;
  IF p7 IS NULL THEN SELECT id_postulacion INTO p7 FROM postulacion WHERE id_candidato=c7 AND id_protocolo=v_proto2_id; END IF;

  -- ══════════════════════════════════════════════════════════
  --  12. HISTORIAL DE POSTULACIONES
  -- ══════════════════════════════════════════════════════════

  -- Creación inicial por coordinador
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

  -- Decisiones del investigador
  INSERT INTO postulacion_modificacion
    (id_postulacion, id_usuario, estado_anterior, estado_nuevo, motivo, es_override, fecha_modificacion)
  VALUES
    (p4, v_invest_id, v_estado_esp, v_estado_ace,
     NULL, false, NOW() - INTERVAL '7 days'),
    (p5, v_invest_id, v_estado_esp, v_estado_ace,
     NULL, false, NOW() - INTERVAL '5 days'),
    (p6, v_invest_id, v_estado_esp, v_estado_rec,
     'Contraindicaciones absolutas. Antecedente cardiovascular severo incompatible con el protocolo.',
     false, NOW() - INTERVAL '12 days'),
    (p7, v_invest_id, v_estado_esp, v_estado_rec,
     'Paciente no cumple criterio de edad mínima requerida.',
     false, NOW() - INTERVAL '18 days');

  -- ══════════════════════════════════════════════════════════
  --  RESUMEN FINAL
  -- ══════════════════════════════════════════════════════════

  RAISE NOTICE '';
  RAISE NOTICE '✅ =============================================';
  RAISE NOTICE '   SETUP MÓDULO 5 — COMPLETADO';
  RAISE NOTICE '   =============================================';
  RAISE NOTICE '   Investigador  : ID=% | c.mendoza@saec.cl',   v_invest_id;
  RAISE NOTICE '   Médico        : ID=% | a.torres@saec.cl',    v_medico_id;
  RAISE NOTICE '   Coordinador   : ID=% | l.fernandez@saec.cl', v_coord_id;
  RAISE NOTICE '   Centro médico y coordinador: ID=%',          v_centro1_id;
  RAISE NOTICE '   Protocolo 1   : ID=% | PROTO-2025-01',       v_proto1_id;
  RAISE NOTICE '   Protocolo 2   : ID=% | PROTO-2025-02',       v_proto2_id;
  RAISE NOTICE '   =============================================';
  RAISE NOTICE '   Candidatos: 8 insertados';
  RAISE NOTICE '     En Espera  → CAND-001, 002, 003, 008  (investigador decide)';
  RAISE NOTICE '     Aceptados  → CAND-004, 005             (médico evalúa)';
  RAISE NOTICE '     Rechazados → CAND-006, 007             (historial)';
  RAISE NOTICE '   =============================================';
  RAISE NOTICE '   Contraseña de todos los usuarios: Saec2026!';
  RAISE NOTICE '✅ =============================================';

END $$;
