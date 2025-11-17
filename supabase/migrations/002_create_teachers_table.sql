-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    qr_code UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    credential_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_teachers_class_id ON teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_qr_code ON teachers(qr_code);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for development)
CREATE POLICY "Allow public read access to teachers"
ON teachers FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to teachers"
ON teachers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to teachers"
ON teachers FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access to teachers"
ON teachers FOR DELETE
USING (true);
