-- =====================================================
-- Digital Newspaper Database Schema
-- Supabase SQL Scripts
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'editor', 'admin')),
  bio TEXT,
  website TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARTICLES TABLE
-- =====================================================

-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARTICLE_LIKES TABLE
-- =====================================================

-- Create article likes table
CREATE TABLE article_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- =====================================================
-- ARTICLE_BOOKMARKS TABLE
-- =====================================================

-- Create article bookmarks table
CREATE TABLE article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_views()
RETURNS INTEGER AS $$
BEGIN
  RETURN views + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'reader')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update article comments count
CREATE OR REPLACE FUNCTION update_article_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on articles
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on comments
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update article comments count
CREATE TRIGGER update_article_comments_count_insert
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION update_article_comments_count();

CREATE TRIGGER update_article_comments_count_delete
  AFTER DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_article_comments_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- ARTICLES POLICIES
-- =====================================================

-- Articles are viewable by everyone if published
CREATE POLICY "Articles are viewable by everyone" ON articles
  FOR SELECT USING (status = 'published');

-- Users can view their own articles regardless of status
CREATE POLICY "Users can view their own articles" ON articles
  FOR SELECT USING (auth.uid() = author_id);

-- Authenticated users can create articles
CREATE POLICY "Users can create articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own articles
CREATE POLICY "Users can update their own articles" ON articles
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own articles
CREATE POLICY "Users can delete their own articles" ON articles
  FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

-- Comments are viewable by everyone
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Only admins can manage categories
CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- ARTICLE_LIKES POLICIES
-- =====================================================

-- Likes are viewable by everyone
CREATE POLICY "Likes are viewable by everyone" ON article_likes
  FOR SELECT USING (true);

-- Authenticated users can like articles
CREATE POLICY "Authenticated users can like articles" ON article_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can unlike their own likes" ON article_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ARTICLE_BOOKMARKS POLICIES
-- =====================================================

-- Bookmarks are viewable by their owner
CREATE POLICY "Bookmarks are viewable by owner" ON article_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can bookmark articles
CREATE POLICY "Authenticated users can bookmark articles" ON article_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their own bookmarks
CREATE POLICY "Users can remove their own bookmarks" ON article_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Articles indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_views ON articles(views);
CREATE INDEX idx_articles_title_gin ON articles USING gin(to_tsvector('english', title));
CREATE INDEX idx_articles_content_gin ON articles USING gin(to_tsvector('english', content));

-- Comments indexes
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_approved ON comments(is_approved);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Article likes indexes
CREATE INDEX idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX idx_article_likes_user_id ON article_likes(user_id);

-- Article bookmarks indexes
CREATE INDEX idx_article_bookmarks_article_id ON article_bookmarks(article_id);
CREATE INDEX idx_article_bookmarks_user_id ON article_bookmarks(user_id);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, color) VALUES
('Thời sự', 'thoi-su', 'Tin tức thời sự trong nước và quốc tế', '#EF4444'),
('Thế giới', 'the-gioi', 'Tin tức thế giới và quốc tế', '#3B82F6'),
('Kinh doanh', 'kinh-doanh', 'Tin tức kinh tế và tài chính', '#10B981'),
('Công nghệ', 'cong-nghe', 'Tin tức công nghệ và khoa học', '#8B5CF6'),
('Thể thao', 'the-thao', 'Tin tức thể thao và giải trí', '#F59E0B'),
('Giải trí', 'giai-tri', 'Tin tức giải trí và văn hóa', '#EC4899'),
('Sức khỏe', 'suc-khoe', 'Tin tức sức khỏe và y tế', '#06B6D4'),
('Du lịch', 'du-lich', 'Tin tức du lịch và khám phá', '#84CC16');

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Create view for article statistics
CREATE VIEW article_stats AS
SELECT 
  a.id,
  a.title,
  a.views,
  a.comments_count,
  COUNT(al.id) as likes_count,
  COUNT(ab.id) as bookmarks_count,
  a.published_at,
  p.full_name as author_name,
  c.name as category_name
FROM articles a
LEFT JOIN profiles p ON a.author_id = p.id
LEFT JOIN categories c ON a.category = c.name
LEFT JOIN article_likes al ON a.id = al.article_id
LEFT JOIN article_bookmarks ab ON a.id = ab.article_id
WHERE a.status = 'published'
GROUP BY a.id, a.title, a.views, a.comments_count, a.published_at, p.full_name, c.name;

-- Create view for user statistics
CREATE VIEW user_stats AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  COUNT(DISTINCT a.id) as articles_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT al.id) as likes_given,
  COUNT(DISTINCT ab.id) as bookmarks_count,
  p.created_at
FROM profiles p
LEFT JOIN articles a ON p.id = a.author_id AND a.status = 'published'
LEFT JOIN comments c ON p.id = c.user_id AND c.is_approved = true
LEFT JOIN article_likes al ON p.id = al.user_id
LEFT JOIN article_bookmarks ab ON p.id = ab.user_id
GROUP BY p.id, p.full_name, p.email, p.role, p.created_at;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
