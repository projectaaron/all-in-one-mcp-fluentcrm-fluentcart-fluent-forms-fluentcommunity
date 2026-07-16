/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  crm_contacts: ['id', 'email', 'first_name', 'last_name', 'status', 'contact_type', 'source', 'created_at', 'last_activity'],
  crm_lists: ['id', 'title', 'slug', 'description', 'created_at'],
  crm_tags: ['id', 'title', 'slug', 'description', 'created_at'],
  crm_segments: ['id', 'title', 'slug', 'subtitle', 'created_at'],
  crm_companies: ['id', 'name', 'email', 'industry', 'type', 'owner_id', 'created_at'],
  crm_campaigns: ['id', 'title', 'status', 'email_subject', 'scheduled_at', 'created_at', 'recipients_count'],
  crm_recurring_campaigns: ['id', 'title', 'status', 'scheduled_at', 'created_at'],
  crm_sequences: ['id', 'title', 'status', 'created_at'],
  crm_automations: ['id', 'title', 'status', 'trigger_name', 'created_at', 'subscribers_count'],
  crm_templates: ['id', 'ID', 'title', 'post_title', 'post_status', 'created_at', 'edited_at'],
  crm_sms: ['id', 'title', 'status', 'created_at'],
};
