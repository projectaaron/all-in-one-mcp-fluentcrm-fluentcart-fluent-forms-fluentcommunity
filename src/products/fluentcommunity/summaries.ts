/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved, and fields a
 *  record doesn't carry are simply skipped — FluentCommunity publishes no
 *  response schemas, so these name the columns its own portal reads. Feed
 *  and chat records matter most: both embed full message bodies that would
 *  otherwise dominate a listing. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  community_spaces: ['id', 'title', 'slug', 'type', 'privacy', 'status', 'members_count', 'created_at'],
  community_feeds: ['id', 'title', 'slug', 'type', 'content_type', 'status', 'user_id', 'space_id', 'comments_count', 'reactions_count', 'created_at'],
  community_chat: ['id', 'title', 'type', 'user_id', 'thread_id', 'message', 'created_at'],
  community_courses: ['id', 'title', 'slug', 'status', 'privacy', 'students_count', 'created_at'],
  community_profiles: ['id', 'user_id', 'username', 'display_name', 'email', 'status', 'last_activity', 'created_at'],
  community_admin: ['id', 'title', 'name', 'slug', 'status', 'created_at'],
};
