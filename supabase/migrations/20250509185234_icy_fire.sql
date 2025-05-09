/*
  # Reset and recreate anomalies table

  1. Changes
    - Drop existing table and policies
    - Create fresh anomalies table with proper constraints
    - Set up appropriate indexes
    - Configure RLS policies

  2. Security
    - Enable RLS
    - Allow public access for both read and write operations
    - Add proper indexes for performance
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS anomalies;

-- Create fresh anomalies table
CREATE TABLE anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date timestamptz NOT NULL,
  usage_kwh double precision NOT NULL,
  co2_tco2 double precision NOT NULL,
  power_factor double precision NOT NULL,
  anomaly_label text NOT NULL,
  fmea_diagnosis text NOT NULL,
  alert_level integer NOT NULL,
  file_id text NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_anomalies_date ON anomalies (date DESC);
CREATE INDEX idx_anomalies_file_id ON anomalies (file_id);
CREATE INDEX idx_anomalies_alert_level ON anomalies (alert_level);

-- Enable RLS
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access"
  ON anomalies
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON anomalies
  FOR INSERT
  WITH CHECK (true);