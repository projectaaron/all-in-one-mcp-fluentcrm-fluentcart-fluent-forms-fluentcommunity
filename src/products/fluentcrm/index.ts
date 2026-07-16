import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const fluentcrm: ProductModule = {
  key: 'fluentcrm',
  title: 'FluentCRM',
  namespace: 'fluent-crm/v2',
  envPrefix: 'FLUENTCRM',
  toolPrefix: 'crm',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    idempotent: TOOL_META[name].idempotent,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/tags', query: { per_page: 1 }, label: 'list tags (1)' },
};
