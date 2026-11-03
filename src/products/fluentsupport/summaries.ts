/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved, and fields a
 *  record doesn't carry are simply skipped — Fluent Support publishes
 *  response schemas only for a subset of routes, so these name the columns
 *  its own agent portal lists. Ticket and response records embed full
 *  message bodies that would otherwise dominate a listing. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  support_tickets: ['id', 'title', 'status', 'priority', 'client_priority', 'customer_id', 'agent_id', 'mailbox_id', 'product_id', 'response_count', 'last_customer_response', 'last_agent_response', 'created_at', 'resolved_at'],
  support_replies: ['id', 'ticket_id', 'person_id', 'conversation_type', 'source', 'title', 'created_at'],
  support_customers: ['id', 'first_name', 'last_name', 'email', 'status', 'user_id', 'created_at'],
  support_agents: ['id', 'first_name', 'last_name', 'email', 'status', 'user_id', 'title', 'created_at'],
  support_mailboxes: ['id', 'name', 'slug', 'email', 'box_type', 'is_default', 'created_at'],
  support_workflows: ['id', 'title', 'status', 'trigger_key', 'trigger_type', 'created_at'],
  support_products: ['id', 'title', 'slug', 'created_at'],
  support_portal: ['id', 'title', 'status', 'priority', 'customer_id', 'created_at'],
};
