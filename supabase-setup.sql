-- Hackathon Form Submission Table Setup for Supabase
-- Run this in your Supabase SQL Editor when you're ready to switch from demo mode

-- Create hackathon_submissions table
CREATE TABLE hackathon_submissions (
  id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  team_lead_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT NOT NULL,
  git_link TEXT,
  project_url TEXT,
  other_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read" ON hackathon_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON hackathon_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON hackathon_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON hackathon_submissions FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_hackathon_created ON hackathon_submissions(created_at DESC);
CREATE INDEX idx_hackathon_team ON hackathon_submissions(team_name);
CREATE INDEX idx_hackathon_email ON hackathon_submissions(email);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_hackathon_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS update_hackathon_timestamp ON hackathon_submissions;
CREATE TRIGGER update_hackathon_timestamp
  BEFORE UPDATE ON hackathon_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_hackathon_timestamp();

-- Optional: Add some sample data for testing
INSERT INTO hackathon_submissions (
  id, team_name, team_lead_name, email, contact, 
  git_link, project_url, other_details
) VALUES 
(
  'sample_' || extract(epoch from now())::text,
  'Sample Team',
  'John Doe', 
  'john@example.com',
  '+1 (555) 000-0000',
  'https://github.com/sample/project',
  'https://sample-project.vercel.app',
  'This is a sample hackathon submission for testing purposes.'
);

-- Verify the table was created successfully
SELECT * FROM hackathon_submissions LIMIT 1;