-- Add company_name column to meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS context TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS uploaded_files JSONB DEFAULT '[]'::jsonb;

-- Create index for company_name for faster queries
CREATE INDEX IF NOT EXISTS idx_meetings_company_name ON meetings(company_name);
