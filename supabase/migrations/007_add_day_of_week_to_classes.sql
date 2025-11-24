-- Agregar campo para día de la semana que se imparte la clase
ALTER TABLE classes
ADD COLUMN day_of_week TEXT NOT NULL DEFAULT 'Sábado'
CHECK (day_of_week IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'));

COMMENT ON COLUMN classes.day_of_week IS 'Día de la semana en que se imparte la clase';
