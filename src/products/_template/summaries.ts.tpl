/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  __TOOL_PREFIX___example_resource: ['id', 'title', 'status', 'created_at'],
};
