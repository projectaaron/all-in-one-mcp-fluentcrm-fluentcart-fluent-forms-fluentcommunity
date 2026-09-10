import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const fluentcommunity: ProductModule = {
  key: 'fluentcommunity',
  title: 'FluentCommunity',
  namespace: 'fluent-community/v2',
  envPrefix: 'FLUENTCOMMUNITY',
  toolPrefix: 'community',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/spaces', query: { per_page: 1 }, label: 'list spaces (1)' },
};
