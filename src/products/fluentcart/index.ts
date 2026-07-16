import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const fluentcart: ProductModule = {
  key: 'fluentcart',
  title: 'FluentCart',
  namespace: 'fluent-cart/v2',
  envPrefix: 'FLUENTCART',
  toolPrefix: 'cart',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/labels', query: { per_page: 1 }, label: 'list labels (1)' },
};
