-- Create attendance_settings table
CREATE TABLE IF NOT EXISTS attendance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIME NOT NULL DEFAULT '07:00:00',
    end_time TIME NOT NULL DEFAULT '13:00:00',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO attendance_settings (start_time, end_time, is_active)
VALUES ('07:00:00', '13:00:00', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for development)
CREATE POLICY "Allow public read access to attendance_settings"
ON attendance_settings FOR SELECT
USING (true);

CREATE POLICY "Allow public update access to attendance_settings"
ON attendance_settings FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public insert access to attendance_settings"
ON attendance_settings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public delete access to attendance_settings"
ON attendance_settings FOR DELETE
USING (true);
