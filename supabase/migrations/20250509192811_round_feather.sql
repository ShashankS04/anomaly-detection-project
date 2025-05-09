-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_kwh DOUBLE PRECISION NOT NULL,
  co2_tco2 DOUBLE PRECISION NOT NULL,
  power_factor DOUBLE PRECISION NOT NULL,
  anomaly_label TEXT NOT NULL,
  fmea_diagnosis TEXT NOT NULL,
  alert_level INTEGER NOT NULL,
  file_id TEXT NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_anomalies_date ON anomalies (date DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_file_id ON anomalies (file_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_alert_level ON anomalies (alert_level);

-- Insert demo user
INSERT INTO users (email, password) 
VALUES ('demo@example.com', '$2a$10$DJVh1tkiXxSw1vFoVL1XOeKgAyW9vKiEV9vCWGz9.O8bFXOyXK9Hy')
ON CONFLICT (email) DO NOTHING;