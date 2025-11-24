-- ============================================
-- DATOS DE PRUEBA PARA SISTEMA DE ASISTENCIA
-- ============================================
-- Este archivo contiene datos mock para testing y desarrollo
-- Incluye: 2 clases, 12 miembros, registros de asistencia de 4 semanas

-- ============================================
-- 1. CLASES
-- ============================================

-- Clase 1: Matemáticas Avanzadas (Sábados)
INSERT INTO classes (id, name, class_number, day_of_week, start_time, end_time, created_at, updated_at)
VALUES
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Matemáticas Avanzadas',
    'MAT-301',
    'Sábado',
    '09:00:00',
    '12:00:00',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
);

-- Clase 2: Historia Universal (Domingos)
INSERT INTO classes (id, name, class_number, day_of_week, start_time, end_time, created_at, updated_at)
VALUES
(
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'Historia Universal',
    'HIS-201',
    'Domingo',
    '10:00:00',
    '13:00:00',
    NOW() - INTERVAL '55 days',
    NOW() - INTERVAL '55 days'
);

-- ============================================
-- 2. MIEMBROS - Clase Matemáticas (6 miembros)
-- ============================================

INSERT INTO members (id, first_name, last_name, class_id, qr_code, created_at, updated_at)
VALUES
-- Estudiante con asistencia perfecta
(
    '11111111-1111-1111-1111-111111111111',
    'Carlos',
    'Rodríguez',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '91111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '50 days'
),
-- Estudiante con buena asistencia (1 falta)
(
    '22222222-2222-2222-2222-222222222222',
    'María',
    'González',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '92222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '50 days'
),
-- Estudiante con asistencia regular (2 faltas)
(
    '33333333-3333-3333-3333-333333333333',
    'Juan',
    'Martínez',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '93333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '50 days'
),
-- Estudiante con asistencia media (3 faltas)
(
    '44444444-4444-4444-4444-444444444444',
    'Ana',
    'López',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '94444444-4444-4444-4444-444444444444',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '50 days'
),
-- Estudiante con baja asistencia (4 faltas)
(
    '55555555-5555-5555-5555-555555555555',
    'Pedro',
    'Sánchez',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '95555555-5555-5555-5555-555555555555',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '50 days'
),
-- Estudiante con asistencia perfecta
(
    '66666666-6666-6666-6666-666666666666',
    'Laura',
    'Fernández',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '96666666-6666-6666-6666-666666666666',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '50 days'
);

-- ============================================
-- 3. MIEMBROS - Clase Historia (6 miembros)
-- ============================================

INSERT INTO members (id, first_name, last_name, class_id, qr_code, created_at, updated_at)
VALUES
-- Estudiante con asistencia perfecta
(
    '77777777-7777-7777-7777-777777777777',
    'Roberto',
    'Díaz',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    '97777777-7777-7777-7777-777777777777',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days'
),
-- Estudiante con buena asistencia (1 falta)
(
    '88888888-8888-8888-8888-888888888888',
    'Carmen',
    'Ruiz',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    '98888888-8888-8888-8888-888888888888',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days'
),
-- Estudiante con asistencia regular (2 faltas)
(
    '99999999-9999-9999-9999-999999999999',
    'Diego',
    'Torres',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days'
),
-- Estudiante con asistencia media (2 faltas)
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Sofía',
    'Ramírez',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    '9aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days'
),
-- Estudiante con baja asistencia (3 faltas)
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Miguel',
    'Vargas',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    '9bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days'
),
-- Estudiante con asistencia perfecta
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Isabel',
    'Morales',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    '9ccccccc-cccc-cccc-cccc-cccccccccccc',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days'
);

-- ============================================
-- 4. REGISTROS DE ASISTENCIA
-- ============================================

-- Función auxiliar para calcular sábados pasados
-- Nota: Ajusta las fechas según la fecha actual de ejecución

-- ============================================
-- ASISTENCIAS CLASE MATEMÁTICAS (Sábados)
-- ============================================

-- Semana 1 (hace 4 semanas aprox - ajustar según fecha actual)
-- Sábado 1: Todos asisten excepto Pedro
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    CURRENT_DATE - INTERVAL '28 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '28 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '28 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '28 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '9 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
AND id != '55555555-5555-5555-5555-555555555555';

-- Semana 2 (hace 3 semanas)
-- Sábado 2: Todos asisten excepto Ana
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    CURRENT_DATE - INTERVAL '21 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '21 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '21 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '21 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '9 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
AND id != '44444444-4444-4444-4444-444444444444';

-- Semana 3 (hace 2 semanas)
-- Sábado 3: Faltan Juan, Pedro y Ana
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    CURRENT_DATE - INTERVAL '14 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '14 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '14 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '14 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '9 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
AND id NOT IN ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444');

-- Semana 4 (hace 1 semana)
-- Sábado 4: Faltan María y Pedro
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    CURRENT_DATE - INTERVAL '7 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '7 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '7 days' + ((6 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '7 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '9 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
AND id NOT IN ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555');

-- Semana 5 (esta semana - si ya pasó el sábado)
-- Sábado 5: Faltan Pedro y Ana
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE))::int % 7) * INTERVAL '1 day' + INTERVAL '9 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
AND id NOT IN ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444')
AND CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE))::int % 7) * INTERVAL '1 day' <= CURRENT_DATE;

-- ============================================
-- ASISTENCIAS CLASE HISTORIA (Domingos)
-- ============================================

-- Semana 1 (hace 4 semanas)
-- Domingo 1: Todos asisten excepto Miguel
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    CURRENT_DATE - INTERVAL '28 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '28 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '28 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '28 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '10 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
AND id != 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Semana 2 (hace 3 semanas)
-- Domingo 2: Todos asisten
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    CURRENT_DATE - INTERVAL '21 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '21 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '21 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '21 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '10 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e';

-- Semana 3 (hace 2 semanas)
-- Domingo 3: Faltan Diego, Sofía y Miguel
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    CURRENT_DATE - INTERVAL '14 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '14 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '14 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '14 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '10 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
AND id NOT IN ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- Semana 4 (hace 1 semana)
-- Domingo 4: Falta Carmen
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    CURRENT_DATE - INTERVAL '7 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '7 days'))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '7 days' + ((7 - EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '7 days'))::int % 7) * INTERVAL '1 day' + INTERVAL '10 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
AND id != '88888888-8888-8888-8888-888888888888';

-- Semana 5 (esta semana - si ya pasó el domingo)
-- Domingo 5: Falta Miguel
INSERT INTO attendance (person_type, person_id, class_id, date, timestamp)
SELECT
    'member',
    id,
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    CURRENT_DATE + ((7 - EXTRACT(DOW FROM CURRENT_DATE))::int % 7) * INTERVAL '1 day',
    CURRENT_DATE + ((7 - EXTRACT(DOW FROM CURRENT_DATE))::int % 7) * INTERVAL '1 day' + INTERVAL '10 hours' + (random() * INTERVAL '2 hours')
FROM members
WHERE class_id = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
AND id != 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
AND CURRENT_DATE + ((7 - EXTRACT(DOW FROM CURRENT_DATE))::int % 7) * INTERVAL '1 day' <= CURRENT_DATE;

-- ============================================
-- RESUMEN DE DATOS GENERADOS
-- ============================================
--
-- CLASES: 2
--   - Matemáticas Avanzadas (MAT-301) - Sábados 9:00-12:00
--   - Historia Universal (HIS-201) - Domingos 10:00-13:00
--
-- MIEMBROS: 12 (6 por clase)
--   Matemáticas:
--     - Carlos Rodríguez (100% asistencia)
--     - María González (80% asistencia - 1 falta)
--     - Juan Martínez (60% asistencia - 2 faltas)
--     - Ana López (40% asistencia - 3 faltas)
--     - Pedro Sánchez (20% asistencia - 4 faltas)
--     - Laura Fernández (100% asistencia)
--
--   Historia:
--     - Roberto Díaz (100% asistencia)
--     - Carmen Ruiz (80% asistencia - 1 falta)
--     - Diego Torres (60% asistencia - 2 faltas)
--     - Sofía Ramírez (80% asistencia - 1 falta)
--     - Miguel Vargas (40% asistencia - 3 faltas)
--     - Isabel Morales (100% asistencia)
--
-- REGISTROS DE ASISTENCIA: ~50 registros aprox
--   - 5 semanas de clases (según disponibilidad)
--   - Variedad en patrones de asistencia
--   - Horarios aleatorios dentro del rango permitido
-- ============================================
