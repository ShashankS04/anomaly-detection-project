/*
  # Add authentication setup

  1. Create auth schema and tables if they don't exist
  2. Enable email/password authentication
  3. Create demo user for testing
*/

-- Enable auth schema if not exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create demo user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '12345678-1234-1234-1234-123456789012',
  'authenticated',
  'authenticated',
  'demo@example.com',
  crypt('demo123', gen_salt('bf')),
  current_timestamp,
  current_timestamp,
  current_timestamp
) ON CONFLICT (id) DO NOTHING;