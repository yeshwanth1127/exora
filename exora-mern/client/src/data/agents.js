/**
 * Agent definitions: slug, title, description/features, problemSolved.
 * Used for Our Agents section and individual agent pages.
 */
export const AGENTS_DATA = [
  {
    slug: 'inventory-procurement',
    title: 'Inventory & Procurement Agent',
    features: ['Real-time stock tracking', 'Auto-reorder materials', 'Vendor coordination'],
    problemSolved: 'Stockouts and overstocking',
  },
  {
    slug: 'customer-support',
    title: 'Customer Support Agent',
    features: ['Handles common queries', 'Manages tickets', 'Escalates edge cases'],
    problemSolved: 'Support overload',
  },
  {
    slug: 'internal-operations',
    title: 'Internal Operations Agent',
    features: ['Task routing', 'Approvals', 'Inter-department coordination'],
    problemSolved: 'Slow internal execution',
  },
  {
    slug: 'orchestration',
    title: 'Orchestration Agent',
    description: 'Coordinates all agents and workflows',
  },
  {
    slug: 'business-logic',
    title: 'Business Logic Agent',
    description: 'Enforces company rules & policies',
  },
  {
    slug: 'audit-compliance',
    title: 'Audit & Compliance Agent',
    description: 'Maintains logs, reports, and traceability',
  },
  {
    slug: 'optimization',
    title: 'Optimization Agent',
    description: 'Continuously improves processes',
  },
];

export function getAgentBySlug(slug) {
  return AGENTS_DATA.find((a) => a.slug === slug) ?? null;
}
