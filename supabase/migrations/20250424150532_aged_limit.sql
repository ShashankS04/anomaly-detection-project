/*
  # Update anomalies table policies

  1. Changes
    - Drop existing policies
    - Recreate policies for read and insert access
    - Remove service role policy

  2. Security
    - Maintain RLS on anomalies table
    - Allow authenticated users to read all anomalies
    - Allow authenticated users to insert anomalies
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow users to read anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow authenticated users to insert anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow service role to insert anomalies" ON anomalies;

-- Create new policies
CREATE POLICY "Allow users to read anomalies"
  ON anomalies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert anomalies"
  ON anomalies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);