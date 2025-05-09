/*
  # Create anomalies table

  1. New Tables
    - `anomalies`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `date` (timestamp)
      - `usage_kwh` (float)
      - `co2_tco2` (float)
      - `power_factor` (float)
      - `anomaly_label` (text)
      - `fmea_diagnosis` (text)
      - `alert_level` (integer)
      - `file_id` (text)

  2. Security
    - Enable RLS on `anomalies` table
    - Add policy for authenticated users to read all anomalies
    - Add policy for service role to insert anomalies
*/

CREATE TABLE IF NOT EXISTS anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date timestamptz NOT NULL,
  usage_kwh float NOT NULL,
  co2_tco2 float NOT NULL,
  power_factor float NOT NULL,
  anomaly_label text NOT NULL,
  fmea_diagnosis text NOT NULL,
  alert_level integer NOT NULL,
  file_id text NOT NULL
);

ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read anomalies"
  ON anomalies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert anomalies"
  ON anomalies
  FOR INSERT
  TO service_role
  WITH CHECK (true);