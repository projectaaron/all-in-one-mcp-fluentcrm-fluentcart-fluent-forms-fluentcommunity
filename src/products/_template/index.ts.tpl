import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const __PRODUCT_KEY__: ProductModule = {
  key: '__PRODUCT_KEY__',            // e.g. 'fluentforms' — matches docs/api-reference/<key>
  title: '__PRODUCT_TITLE__',        // e.g. 'FluentForms'
  namespace: '__REST_NAMESPACE__',   // e.g. 'fluentform/v1' — confirm from the docs
  envPrefix: '__ENV_PREFIX__',       // e.g. 'FLUENTFORMS' -> FLUENTFORMS_API_USERNAME/_PASSWORD
  toolPrefix: '__TOOL_PREFIX__',     // e.g. 'forms'
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  // A cheap, harmless authenticated GET for verify_setup:
  verifyRead: { path: '/__SOME_SMALL_LIST__', query: { per_page: 1 }, label: 'list __SOME_SMALL_LIST__ (1)' },
};
