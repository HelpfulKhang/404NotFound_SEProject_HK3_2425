-- =====================================================
-- Add MFA preference flag to profiles
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.mfa_enabled IS 'User preference: require MFA on sensitive routes/actions';

-- Optional: Backfill or set per role (example commented)
-- UPDATE profiles SET mfa_enabled = TRUE WHERE role IN ('editor','admin');

-- No RLS changes required; existing UPDATE policy allows users to update their own profile.


