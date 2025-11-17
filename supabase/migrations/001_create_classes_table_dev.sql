-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    class_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_classes_class_number ON classes(class_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA DESARROLLO (permiten acceso sin autenticación)
-- Cambiar estas políticas cuando implementes autenticación

-- Create policy to allow anyone to read all classes
CREATE POLICY "Allow public read access to classes"
ON classes FOR SELECT
USING (true);

-- Create policy to allow anyone to insert classes
CREATE POLICY "Allow public insert access to classes"
ON classes FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to update classes
CREATE POLICY "Allow public update access to classes"
ON classes FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create policy to allow anyone to delete classes
CREATE POLICY "Allow public delete access to classes"
ON classes FOR DELETE
USING (true);
