-- Updated Hackathon Form Submission Table Setup for Supabase
-- Run this in your Supabase SQL Editor when you're ready to switch from demo mode

-- Create hackathon_submissions table
CREATE TABLE hackathon_submissions (
  id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  team_lead_name TEXT NOT NULL,
  team_lead_email TEXT NOT NULL,
  team_lead_contact TEXT NOT NULL,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL CHECK (char_length(project_description) <= 1000),
  git_link TEXT,
  project_url TEXT,
  project_logo_url TEXT,
  project_banner_url TEXT,
  video_demo_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for hackathon assets (logos, banners)
INSERT INTO storage.buckets (id, name, public) VALUES ('hackathon-assets', 'hackathon-assets', true);

-- Enable Row Level Security
ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read" ON hackathon_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON hackathon_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON hackathon_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON hackathon_submissions FOR DELETE USING (true);

-- Storage policies for file uploads
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hackathon-assets');
CREATE POLICY "Allow public downloads" ON storage.objects FOR SELECT USING (bucket_id = 'hackathon-assets');
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'hackathon-assets');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'hackathon-assets');

-- Create indexes for better performance
CREATE INDEX idx_hackathon_created ON hackathon_submissions(created_at DESC);
CREATE INDEX idx_hackathon_team ON hackathon_submissions(team_name);
CREATE INDEX idx_hackathon_email ON hackathon_submissions(team_lead_email);
CREATE INDEX idx_hackathon_project ON hackathon_submissions(project_title);

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
  id, team_name, team_lead_name, team_lead_email, team_lead_contact,
  project_title, project_description, git_link, project_url, video_demo_link
) VALUES 
(
  'sample_' || extract(epoch from now())::text,
  'Sample Team',
  'John Doe', 
  'john@example.com',
  '+1 (555) 000-0000',
  'AI Code Reviewer',
  'An innovative AI-powered code review tool that automatically detects bugs, suggests improvements, and ensures code quality standards. Built with React, Node.js, and machine learning algorithms.',
  'https://github.com/sample/ai-code-reviewer',
  'https://ai-code-reviewer.vercel.app',
  'https://youtube.com/watch?v=sample123'
);

-- Verify the table was created successfully
SELECT * FROM hackathon_submissions LIMIT 1;