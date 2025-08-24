 *** Begin Patch
*** Add File: lib/articles-rls-writer-update-wildcard.sql
+-- =====================================================
+-- Relax writer UPDATE policy to avoid status transition blocks
+-- Allow authors to update their own articles regardless of status change
+-- =====================================================
+
+DROP POLICY IF EXISTS "Writers can update their own draft articles" ON articles;
+
+-- Simpler, permissive writer update policy
+CREATE POLICY "Writers can update their own articles" ON articles
+  FOR UPDATE
+  USING (
+    auth.uid() = author_id
+  )
+  WITH CHECK (
+    auth.uid() = author_id
+  );
+
+-- Keep editors/admins update policy alongside
+DROP POLICY IF EXISTS "Editors and admins can update any article" ON articles;
+CREATE POLICY "Editors and admins can update any article" ON articles
+  FOR UPDATE USING (
+    EXISTS (
+      SELECT 1 FROM profiles p 
+      WHERE p.id = auth.uid() 
+        AND p.role IN ('editor', 'admin')
+    )
+  );
+
+-- =====================================================
+-- End
+-- =====================================================
+
*** End Patch