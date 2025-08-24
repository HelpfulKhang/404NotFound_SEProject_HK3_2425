-- =====================================================
-- Articles RLS Delete Policy Update
-- Ensure writers can delete ONLY their own drafts (pre-submission)
-- Editors/Admins can delete any article
-- Run this safely multiple times (idempotent DROP/CREATE)
-- =====================================================

-- Narrow writer delete policy to drafts only
DROP POLICY IF EXISTS "Writers can delete their own draft articles" ON articles;
CREATE POLICY "Writers can delete their own draft articles" ON articles
  FOR DELETE USING (
    auth.uid() = author_id AND 
    status = 'draft'
  );

-- Ensure editors and admins retain delete-all rights
DROP POLICY IF EXISTS "Editors and admins can delete any article" ON articles;
CREATE POLICY "Editors and admins can delete any article" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- End
-- =====================================================


