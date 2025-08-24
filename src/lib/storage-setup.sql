-- =====================================================
-- Supabase Storage Setup for Article Images
-- Digital Newspaper - Storage Configuration
-- =====================================================

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create article-images bucket for article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create user-avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR ARTICLE IMAGES
-- =====================================================

-- Allow authenticated users to upload article images
CREATE POLICY "Allow authenticated users to upload article images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'article-images' AND
    auth.role() = 'authenticated'
  );

-- Allow public to view article images
CREATE POLICY "Allow public to view article images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'article-images'
  );

-- Allow article authors to update their article images
CREATE POLICY "Allow article authors to update their article images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'article-images' AND
    EXISTS (
      SELECT 1 FROM articles a
      WHERE a.id::text = (storage.foldername(name))[1]
      AND a.author_id = auth.uid()
    )
  );

-- Allow article authors to delete their article images
CREATE POLICY "Allow article authors to delete their article images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'article-images' AND
    EXISTS (
      SELECT 1 FROM articles a
      WHERE a.id::text = (storage.foldername(name))[1]
      AND a.author_id = auth.uid()
    )
  );

-- Allow editors and admins to manage all article images
CREATE POLICY "Allow editors and admins to manage all article images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'article-images' AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- STORAGE POLICIES FOR USER AVATARS
-- =====================================================

-- Allow users to upload their own avatar
CREATE POLICY "Allow users to upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
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
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Allow users to delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- FUNCTIONS FOR IMAGE MANAGEMENT
-- =====================================================

-- Function to generate unique image filename
CREATE OR REPLACE FUNCTION generate_image_filename(article_id UUID, original_filename TEXT)
RETURNS TEXT AS $$
DECLARE
  file_extension TEXT;
  unique_filename TEXT;
BEGIN
  -- Extract file extension
  file_extension := substring(original_filename from '\.([^.]*)$');
  
  -- Generate unique filename
  unique_filename := article_id::text || '/' || gen_random_uuid()::text || '.' || file_extension;
  
  RETURN unique_filename;
END;
$$ LANGUAGE plpgsql;

-- Function to get article image URL
CREATE OR REPLACE FUNCTION get_article_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://' || current_setting('app.supabase_url') || '/storage/v1/object/public/article-images/' || image_path;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
