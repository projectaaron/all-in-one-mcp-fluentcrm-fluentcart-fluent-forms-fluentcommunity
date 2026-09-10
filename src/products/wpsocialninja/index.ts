import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const wpsocialninja: ProductModule = {
  key: 'wpsocialninja',
  title: 'WP Social Ninja',
  namespace: 'wpsocialreviews/v2',
  envPrefix: 'WPSOCIALNINJA',
  toolPrefix: 'social',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/platforms/enabled', label: 'list enabled platforms' },
};
