-- =====================================================
-- Avatar Storage Fix
-- Digital Newspaper - Fix Avatar Upload Issues
-- =====================================================

-- =====================================================
-- ENSURE USER-AVATARS BUCKET EXISTS
-- =====================================================

-- Create user-avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DROP EXISTING POLICIES (IF ANY)
-- =====================================================

DROP POLICY IF EXISTS "Allow users to upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatar" ON storage.objects;

-- =====================================================
-- CREATE UPDATED STORAGE POLICIES FOR USER AVATARS
-- =====================================================

-- Allow users to upload their own avatar
CREATE POLICY "Allow users to upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public to view user avatars
CREATE POLICY "Allow public to view user avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-avatars'
  );

-- Allow users to update their own avatar
CREATE POLICY "Allow users to update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Allow users to delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- ADD AVATAR_URL COLUMN TO PROFILES IF NOT EXISTS
-- =====================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- =====================================================
-- CREATE INDEX FOR AVATAR_URL
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);

-- =====================================================
-- END OF SCRIPT
-- =====================================================
