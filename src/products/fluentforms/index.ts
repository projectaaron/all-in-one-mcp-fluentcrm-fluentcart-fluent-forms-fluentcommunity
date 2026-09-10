import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const fluentforms: ProductModule = {
  key: 'fluentforms',
  title: 'Fluent Forms',
  namespace: 'fluentform/v1',
  envPrefix: 'FLUENTFORMS',
  toolPrefix: 'forms',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/forms', query: { per_page: 1 }, label: 'list forms (1)' },
};
