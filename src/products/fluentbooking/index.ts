import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { SUMMARY_FIELDS } from './summaries.js';

export const fluentbooking: ProductModule = {
  key: 'fluentbooking',
  title: 'FluentBooking',
  namespace: 'fluent-booking/v2',
  envPrefix: 'FLUENTBOOKING',
  toolPrefix: 'booking',
  tools: Object.entries(TOOL_ENDPOINTS).map(([name, actions]) => ({
    name,
    description: TOOL_META[name].description,
    note: TOOL_META[name].note,
    actions,
  })),
  summaryFields: SUMMARY_FIELDS,
  verifyRead: { path: '/calendars', query: { per_page: 1 }, label: 'list calendars (1)' },
};
