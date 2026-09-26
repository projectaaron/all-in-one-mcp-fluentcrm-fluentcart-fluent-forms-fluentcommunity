import type { ProductModule } from '../../core/types.js';
import { TOOL_ENDPOINTS, TOOL_META } from './endpoints.gen.js';
import { ANALYTICS_MAP_TOOLS, registerAnalyticsTools } from './analytics-tools.js';
import { BULK_FILTER_MAP_TOOLS, registerBulkFilterTool } from './bulk-filter-tool.js';
import { registerSequenceTools, SEQUENCE_EXTRA_MAP_TOOLS } from './sequence-tools.js';
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
  extras: {
    area: 'crm_sequences',
    mapTools: [...SEQUENCE_EXTRA_MAP_TOOLS, ...ANALYTICS_MAP_TOOLS, ...BULK_FILTER_MAP_TOOLS],
    newAreas: {
      crm_analytics:
        'Read-only analysis FluentCRM\'s REST API has no single endpoint for: per-email automation stats, why contacts left an automation, likely bot signups.',
    },
    register: (server, client, settings) => [
      ...registerSequenceTools(server, client),
      ...registerAnalyticsTools(server, client, settings),
      ...registerBulkFilterTool(server, client, settings),
    ],
  },
};
