import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const fluentsupport: ProductModule = {
  key: 'fluentsupport',
  title: 'Fluent Support',
  namespace: 'fluent-support/v2',
  envPrefix: 'FLUENTSUPPORT',
  toolPrefix: 'support',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/mailboxes', query: { per_page: 1 }, label: 'list mailboxes (1)' },
};
