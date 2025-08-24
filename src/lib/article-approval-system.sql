-- =====================================================
-- Article Approval System & Image Storage
-- Digital Newspaper - Additional Database Schema
-- =====================================================

-- =====================================================
-- UPDATE ARTICLES TABLE FOR APPROVAL WORKFLOW
-- =====================================================

-- Add approval fields to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS image_caption TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- =====================================================
-- ARTICLE APPROVAL HISTORY TABLE
-- =====================================================

-- Create article approval history table
CREATE TABLE IF NOT EXISTS article_approval_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'requested_changes')),
  status_from TEXT NOT NULL,
  status_to TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARTICLE IMAGES TABLE
-- =====================================================

-- Create article images table for multiple images per article
CREATE TABLE IF NOT EXISTS article_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS FOR ARTICLE WORKFLOW
-- =====================================================

-- Function to update word count
CREATE OR REPLACE FUNCTION update_article_word_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count = array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle article submission
CREATE OR REPLACE FUNCTION submit_article_for_review(article_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE articles 
  SET 
    status = 'pending',
    submitted_at = NOW()
  WHERE id = article_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve article
CREATE OR REPLACE FUNCTION approve_article(article_uuid UUID, reviewer_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE articles 
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = reviewer_uuid
  WHERE id = article_uuid;
  
  -- Log approval action
  INSERT INTO article_approval_history (
    article_id, 
    reviewer_id, 
    reviewer_name, 
    action, 
    status_from, 
    status_to, 
    comments
  )
  SELECT 
    article_uuid,
    reviewer_uuid,
    p.full_name,
    'approved',
    'pending',
    'approved',
    'Article approved for publication'
  FROM profiles p WHERE p.id = reviewer_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject article
CREATE OR REPLACE FUNCTION reject_article(article_uuid UUID, reviewer_uuid UUID, reason TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE articles 
  SET 
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = reviewer_uuid,
    rejection_reason = reason
  WHERE id = article_uuid;
  
  -- Log rejection action
  INSERT INTO article_approval_history (
    article_id, 
    reviewer_id, 
    reviewer_name, 
    action, 
    status_from, 
    status_to, 
    comments
  )
  SELECT 
    article_uuid,
    reviewer_uuid,
    p.full_name,
    'rejected',
    'pending',
    'rejected',
    reason
  FROM profiles p WHERE p.id = reviewer_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish article
CREATE OR REPLACE FUNCTION publish_article(article_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE articles 
  SET 
    status = 'published',
    published_at = NOW()
  WHERE id = article_uuid AND status = 'approved';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update word count on article content change
CREATE TRIGGER update_article_word_count_trigger
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_article_word_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE article_approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ARTICLE APPROVAL HISTORY POLICIES
-- =====================================================

-- Writers can view their own article approval history
CREATE POLICY "Writers can view their own article approval history" ON article_approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles a 
      WHERE a.id = article_approval_history.article_id 
      AND a.author_id = auth.uid()
    )
  );

-- Editors and admins can view all approval history
CREATE POLICY "Editors and admins can view all approval history" ON article_approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- Only editors and admins can insert approval history
CREATE POLICY "Only editors and admins can insert approval history" ON article_approval_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- ARTICLE IMAGES POLICIES
-- =====================================================

-- Article authors can manage their article images
CREATE POLICY "Article authors can manage their article images" ON article_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM articles a 
      WHERE a.id = article_images.article_id 
      AND a.author_id = auth.uid()
    )
  );

-- Editors and admins can manage all article images
CREATE POLICY "Editors and admins can manage all article images" ON article_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- UPDATED ARTICLES POLICIES
-- =====================================================

-- Drop existing articles policies
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Users can view their own articles" ON articles;
DROP POLICY IF EXISTS "Users can create articles" ON articles;
DROP POLICY IF EXISTS "Users can update their own articles" ON articles;
DROP POLICY IF EXISTS "Users can delete their own articles" ON articles;

-- Create updated articles policies
-- Published articles are viewable by everyone
CREATE POLICY "Published articles are viewable by everyone" ON articles
  FOR SELECT USING (status = 'published');

-- Users can view their own articles regardless of status
CREATE POLICY "Users can view their own articles" ON articles
  FOR SELECT USING (auth.uid() = author_id);

-- Editors and admins can view all articles
CREATE POLICY "Editors and admins can view all articles" ON articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- Writers can create articles
CREATE POLICY "Writers can create articles" ON articles
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('writer', 'editor', 'admin')
    )
  );

-- Writers can update their own draft articles
CREATE POLICY "Writers can update their own draft articles" ON articles
  FOR UPDATE USING (
    auth.uid() = author_id AND 
    status IN ('draft', 'rejected')
  );

-- Editors and admins can update any article
CREATE POLICY "Editors and admins can update any article" ON articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- Writers can delete their own draft articles
CREATE POLICY "Writers can delete their own draft articles" ON articles
  FOR DELETE USING (
    auth.uid() = author_id AND 
    status IN ('draft', 'rejected')
  );

-- Editors and admins can delete any article
CREATE POLICY "Editors and admins can delete any article" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Article approval history indexes
CREATE INDEX IF NOT EXISTS idx_article_approval_history_article_id ON article_approval_history(article_id);
CREATE INDEX IF NOT EXISTS idx_article_approval_history_reviewer_id ON article_approval_history(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_article_approval_history_action ON article_approval_history(action);
CREATE INDEX IF NOT EXISTS idx_article_approval_history_created_at ON article_approval_history(created_at);

-- Article images indexes
CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON article_images(article_id);
CREATE INDEX IF NOT EXISTS idx_article_images_display_order ON article_images(display_order);
CREATE INDEX IF NOT EXISTS idx_article_images_is_featured ON article_images(is_featured);

-- Updated articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_submitted_at ON articles(submitted_at);
CREATE INDEX IF NOT EXISTS idx_articles_reviewed_at ON articles(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_articles_reviewed_by ON articles(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_articles_word_count ON articles(word_count);

-- =====================================================
-- VIEWS FOR EDITORIAL DASHBOARD
-- =====================================================

-- Create view for pending articles
CREATE VIEW pending_articles AS
SELECT 
  a.id,
  a.title,
  a.excerpt,
  a.category,
  a.submitted_at,
  a.word_count,
  p.full_name as author_name,
  p.email as author_email
FROM articles a
JOIN profiles p ON a.author_id = p.id
WHERE a.status = 'pending'
ORDER BY a.submitted_at ASC;

-- Create view for article approval statistics
CREATE VIEW article_approval_stats AS
SELECT 
  p.full_name as author_name,
  COUNT(CASE WHEN a.status = 'draft' THEN 1 END) as draft_count,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN a.status = 'published' THEN 1 END) as published_count
FROM profiles p
LEFT JOIN articles a ON p.id = a.author_id
WHERE p.role = 'writer'
GROUP BY p.id, p.full_name;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
