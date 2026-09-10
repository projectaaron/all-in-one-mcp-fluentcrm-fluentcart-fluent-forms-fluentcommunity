/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved, and fields a
 *  record doesn't carry are simply skipped — WP Social Ninja publishes no
 *  response schemas, so these lists name the fields its admin UI relies on. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  social_reviews: ['id', 'platform_name', 'reviewer_name', 'rating', 'review_title', 'status', 'source_id', 'created_at'],
  social_testimonials: ['id', 'platform_name', 'reviewer_name', 'rating', 'review_title', 'status', 'created_at'],
  social_templates: ['id', 'ID', 'post_title', 'post_status', 'platform', 'post_modified'],
  social_platforms: ['id', 'platform', 'name', 'status', 'enabled', 'title'],
  social_chat_widgets: ['id', 'ID', 'post_title', 'post_status', 'platform', 'post_modified'],
  social_notifications: ['id', 'ID', 'post_title', 'post_status', 'post_modified'],
  social_collection: ['id', 'ID', 'post_title', 'title', 'status', 'post_status', 'platform', 'created_at'],
};
