/*
  # Fix anomalies table policies and indexes

  1. Changes
    - Drop existing policies
    - Create new policies with proper access control
    - Add index on date column for better query performance
    - Add index on file_id for faster lookups

  2. Security
    - Enable RLS on anomalies table
    - Allow public read access
    - Allow public insert access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow inserting anomalies" ON anomalies;

-- Create new policies
CREATE POLICY "Allow users to read anomalies"
  ON anomalies
  FOR SELECT
  USING (true);

CREATE POLICY "Allow inserting anomalies"
  ON anomalies
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anomalies_date
  ON anomalies (date DESC);

CREATE INDEX IF NOT EXISTS idx_anomalies_file_id
  ON anomalies (file_id);