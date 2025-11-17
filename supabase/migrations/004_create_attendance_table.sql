-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_type VARCHAR(10) NOT NULL CHECK (person_type IN ('teacher', 'member')),
    person_id UUID NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint para prevenir duplicados del mismo día
    CONSTRAINT unique_attendance_per_day UNIQUE(person_type, person_id, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_person ON attendance(person_type, person_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp);

-- Enable Row Level Security
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for development)
CREATE POLICY "Allow public read access to attendance"
ON attendance FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to attendance"
ON attendance FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to attendance"
ON attendance FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access to attendance"
ON attendance FOR DELETE
USING (true);
