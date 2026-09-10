/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved, and fields a
 *  record doesn't carry are simply skipped — Fluent Forms publishes no
 *  response schemas, so these name the columns its own admin UI reads.
 *  Submissions matter most here: a raw entry embeds the full response
 *  payload, which floods a listing without the projection. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  forms_forms: ['id', 'title', 'type', 'status', 'has_payment', 'total_views', 'created_at'],
  forms_submissions: ['id', 'form_id', 'serial_number', 'status', 'is_favourite', 'user_id', 'browser', 'created_at'],
  forms_integrations: ['id', 'title', 'name', 'module_name', 'status', 'enabled'],
  forms_admin: ['id', 'title', 'name', 'email', 'status'],
};
