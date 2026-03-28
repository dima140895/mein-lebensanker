ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS health_data_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS health_data_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;