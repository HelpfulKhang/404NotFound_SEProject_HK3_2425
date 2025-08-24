-- =====================================================
-- Articles RLS Update: allow writers to submit drafts for review
-- This script adjusts UPDATE policies so that writers can change
-- status from 'draft'/'rejected' to 'pending' without being blocked
-- by WITH CHECK on the updated row.
-- =====================================================

-- Drop and recreate writer UPDATE policy with explicit WITH CHECK
DROP POLICY IF EXISTS "Writers can update their own draft articles" ON articles;

-- Writers can update their own draft/rejected articles (including setting status to pending)
CREATE POLICY "Writers can update their own draft articles" ON articles
  FOR UPDATE
  USING (
    auth.uid() = author_id AND status IN ('draft', 'rejected')
  )
  WITH CHECK (
    auth.uid() = author_id AND status IN ('draft', 'pending', 'rejected')
  );

-- Ensure editors and admins can still update any article (idempotent)
DROP POLICY IF EXISTS "Editors and admins can update any article" ON articles;
CREATE POLICY "Editors and admins can update any article" ON articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- End of RLS update
-- =====================================================


