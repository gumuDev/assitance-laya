-- Add time fields to classes table
ALTER TABLE classes
ADD COLUMN start_time TIME NOT NULL DEFAULT '07:00:00',
ADD COLUMN end_time TIME NOT NULL DEFAULT '13:00:00';

-- Add comment to explain the fields
COMMENT ON COLUMN classes.start_time IS 'Hora de inicio para registro de asistencia';
COMMENT ON COLUMN classes.end_time IS 'Hora de fin para registro de asistencia';
