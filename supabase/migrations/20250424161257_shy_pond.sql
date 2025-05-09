/*
  # Update anomalies table RLS policies

  1. Changes
    - Drop existing policies
    - Add new policy for inserting anomalies without authentication
    - Keep existing read policy

  2. Security
    - Allow public access for inserting anomalies
    - Maintain read access for all users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow authenticated users to insert anomalies" ON anomalies;

-- Create new policies
CREATE POLICY "Allow users to read anomalies"
  ON anomalies
  FOR SELECT
  USING (true);

CREATE POLICY "Allow inserting anomalies"
  ON anomalies
  FOR INSERT
  WITH CHECK (true);