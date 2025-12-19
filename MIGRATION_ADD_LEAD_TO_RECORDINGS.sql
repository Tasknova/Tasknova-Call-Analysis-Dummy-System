-- Migration: Add lead_id column to recordings table
-- This allows associating each recording with a specific lead

-- Add lead_id column to recordings table
ALTER TABLE recordings 
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_recordings_lead_id ON recordings(lead_id);

-- Add comment to document the column
COMMENT ON COLUMN recordings.lead_id IS 'Foreign key reference to the lead associated with this recording';
