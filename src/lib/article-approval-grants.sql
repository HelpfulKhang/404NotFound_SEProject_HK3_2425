-- =====================================================
-- Grants for Article Approval RPCs
-- Ensure authenticated users can call workflow functions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant execute on functions (idempotent via REVOKE+GRANT pattern not required here)
GRANT EXECUTE ON FUNCTION public.submit_article_for_review(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_article(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_article(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_article(uuid) TO authenticated;

-- Optional: views
GRANT SELECT ON TABLE public.pending_articles TO authenticated;
GRANT SELECT ON TABLE public.article_approval_stats TO authenticated;

-- Note: RLS policies still govern table access. These GRANTs only allow calling the functions.

-- =====================================================
-- End of grants
-- =====================================================


